import express from 'express';
import { validateTelegramWebApp } from '../middleware/telegramAuth.js';
import { requireSubscription } from '../middleware/subscriptionCheck.js';
import { createConfigLimiter } from '../middleware/rateLimiter.js';
import xrayService from '../services/xrayService.js';
import databaseService from '../services/databaseService.js';
import {
  getUserAntigluschConfigCount,
  getMaxAntigluschConfigsPerUser,
  canCreateAntigluschConfig,
  getOrCreateUser,
} from '../services/userService.js';
import { getUserIdentifier } from '../utils/userIdentifier.js';
import { config } from '../config/env.js';

const router = express.Router();

const FREE = config.featureFlags.freeAntiglusch;

// Пропускаем проверку подписки если FREE_ANTIGLUSCH
const subscriptionMiddleware = FREE ? (req, res, next) => next() : requireSubscription;

/**
 * GET /api/antiglusch
 * Список AntiGlusch конфигов пользователя
 */
router.get('/', validateTelegramWebApp, async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    const user = await getOrCreateUser(telegramUser);
    const dbConfigs = await databaseService.getUserAntigluschConfigs(user.id);
    const count = dbConfigs.length;
    const maxCount = await getMaxAntigluschConfigsPerUser(telegramUser);

    const configs = dbConfigs.map((config) => ({
      id: config.id,
      name: config.name,
      created: config.createdAt.toISOString(),
      enabled: config.enabled,
    }));

    res.json({ configs, count, maxCount });
  } catch (error) {
    console.error('Error in GET /antiglusch:', error);
    res.status(500).json({ error: 'Failed to fetch antiglusch configs' });
  }
});

/**
 * POST /api/antiglusch
 * Создать новый AntiGlusch конфиг
 */
router.post('/', validateTelegramWebApp, subscriptionMiddleware, createConfigLimiter, async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    const { name: customName } = req.body;
    const user = await getOrCreateUser(telegramUser);

    if (!FREE) {
      const canCreate = await canCreateAntigluschConfig(telegramUser);
      if (!canCreate) {
        const count = await getUserAntigluschConfigCount(telegramUser);
        const maxCount = await getMaxAntigluschConfigsPerUser(telegramUser);
        return res.status(403).json({
          error: `Достигнут лимит AntiGlusch конфигов (${count}/${maxCount})`,
        });
      }
    }

    const identifier = getUserIdentifier(telegramUser);
    const email = `${identifier}_ag_${Date.now()}`;
    const configName = customName || email;

    // Гарантируем загрузку Reality ключей
    await xrayService.ensureRealityKeys();

    // Создаём клиента в 3x-ui
    const { uuid } = await xrayService.createClient(email);

    // Генерируем VLESS URL
    const vlessUrl = xrayService.generateVlessUrl(uuid, configName);

    // Сохраняем в БД
    const dbConfig = await databaseService.createAntigluschConfig(
      user.id,
      configName,
      uuid,
      email,
      vlessUrl
    );

    res.json({
      success: true,
      config: {
        id: dbConfig.id,
        name: dbConfig.name,
        configData: dbConfig.configData,
      },
    });
  } catch (error) {
    console.error('Error in POST /antiglusch:', error);
    res.status(500).json({ error: 'Failed to create antiglusch config' });
  }
});

/**
 * GET /api/antiglusch/:id/link
 * Получить VLESS ссылку
 */
router.get('/:id/link', validateTelegramWebApp, subscriptionMiddleware, async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    const { id } = req.params;
    const user = await getOrCreateUser(telegramUser);
    const config = await databaseService.getAntigluschConfigById(id);

    if (!config || config.userId !== user.id) {
      return res.status(404).json({ error: 'Config not found' });
    }

    // Всегда пересобираем URL с актуальными Reality ключами
    await xrayService.ensureRealityKeys();
    const freshLink = xrayService.generateVlessUrl(config.xrayClientId, config.name);

    res.json({ link: freshLink });
  } catch (error) {
    console.error('Error in GET /antiglusch/:id/link:', error);
    res.status(500).json({ error: 'Failed to get link' });
  }
});

/**
 * DELETE /api/antiglusch/:id
 * Удалить AntiGlusch конфиг
 */
router.delete('/:id', validateTelegramWebApp, async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    const { id } = req.params;
    const user = await getOrCreateUser(telegramUser);
    const config = await databaseService.getAntigluschConfigById(id);

    if (!config || config.userId !== user.id) {
      return res.status(404).json({ error: 'Config not found' });
    }

    if (config.xrayClientId) {
      try {
        await xrayService.deleteClient(config.xrayClientId);
      } catch (error) {
        console.error('Failed to delete from 3x-ui:', error);
      }
    }

    await databaseService.deleteAntigluschConfig(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /antiglusch/:id:', error);
    res.status(500).json({ error: 'Failed to delete config' });
  }
});

/**
 * POST /api/antiglusch/:id/disable
 * Отключить AntiGlusch конфиг
 */
router.post('/:id/disable', validateTelegramWebApp, async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    const { id } = req.params;
    const user = await getOrCreateUser(telegramUser);
    const config = await databaseService.getAntigluschConfigById(id);

    if (!config || config.userId !== user.id) {
      return res.status(404).json({ error: 'Config not found' });
    }

    if (config.xrayClientId && config.xrayEmail) {
      try {
        await xrayService.disableClient(config.xrayClientId, config.xrayEmail);
      } catch (error) {
        console.error('Failed to disable in 3x-ui:', error);
      }
    }

    await databaseService.disableAntigluschConfig(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in POST /antiglusch/:id/disable:', error);
    res.status(500).json({ error: 'Failed to disable config' });
  }
});

export default router;
