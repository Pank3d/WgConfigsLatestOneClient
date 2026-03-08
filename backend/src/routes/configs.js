import express from 'express';
import { validateTelegramWebApp } from '../middleware/telegramAuth.js';
import { requireSubscription } from '../middleware/subscriptionCheck.js';
import { createConfigLimiter } from '../middleware/rateLimiter.js';
import wireguardService from '../services/wireguardService.js';
import databaseService from '../services/databaseService.js';
import { getUserConfigCount, getMaxConfigsPerUser, canCreateConfig, getOrCreateUser } from '../services/userService.js';
import { getUserIdentifier } from '../utils/userIdentifier.js';

const router = express.Router();

/**
 * GET /api/configs
 * Получить список конфигов пользователя из БД
 */
router.get('/', validateTelegramWebApp, async (req, res) => {
  try {
    const telegramUser = req.telegramUser;

    // Получаем или создаем пользователя в БД
    const user = await getOrCreateUser(telegramUser);

    // Получаем конфиги из БД
    const dbConfigs = await databaseService.getUserConfigs(user.id);
    const count = dbConfigs.length;
    const maxCount = await getMaxConfigsPerUser(telegramUser);

    const configs = dbConfigs.map((config) => ({
      id: config.id,
      name: config.name,
      created: config.createdAt.toISOString(),
      enabled: config.enabled,
    }));

    res.json({
      configs,
      count,
      maxCount,
    });
  } catch (error) {
    console.error('Error in GET /configs:', error);
    res.status(500).json({ error: 'Failed to fetch configs' });
  }
});

/**
 * POST /api/configs
 * Создать новый конфиг в WireGuard и сохранить в БД
 */
router.post('/', validateTelegramWebApp, requireSubscription, createConfigLimiter, async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    const { name: customName } = req.body;

    // Получаем или создаем пользователя в БД
    const user = await getOrCreateUser(telegramUser);

    // Проверка лимита
    const canCreate = await canCreateConfig(telegramUser);
    if (!canCreate) {
      const count = await getUserConfigCount(telegramUser);
      const maxCount = await getMaxConfigsPerUser(telegramUser);
      return res.status(403).json({
        error: `You have reached the maximum limit of configs (${count}/${maxCount})`,
      });
    }

    // Генерация имени конфига
    const identifier = getUserIdentifier(telegramUser);
    const configName = customName || `${identifier}_${Date.now()}`;

    // Создание клиента в WireGuard
    const result = await wireguardService.createClient(configName);

    if (!result.success) {
      return res.status(500).json({ error: 'Failed to create config in WireGuard' });
    }

    // Ждем немного, чтобы клиент успел сохраниться в WireGuard
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Получаем созданного клиента из WireGuard
    const wgClient = await wireguardService.findClientByName(configName);

    if (!wgClient) {
      console.error('Client not found in WireGuard after creation:', configName);
      return res.status(500).json({
        error: 'Config created in WireGuard but not found. Please try again later.',
      });
    }

    // Получаем конфигурацию из WireGuard
    const configData = await wireguardService.getClientConfiguration(wgClient.id);

    // Сохраняем конфиг в БД
    const dbConfig = await databaseService.createConfig(
      user.id,
      configName,
      wgClient.id,
      configData
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
    console.error('Error in POST /configs:', error);
    res.status(500).json({ error: 'Failed to create config' });
  }
});

/**
 * GET /api/configs/:id/download
 * Скачать конфиг файл из БД
 */
router.get('/:id/download', validateTelegramWebApp, requireSubscription, async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    const { id } = req.params;

    // Получаем пользователя из БД
    const user = await getOrCreateUser(telegramUser);

    // Получаем конфиг из БД и проверяем принадлежность
    const config = await databaseService.getConfigById(id);

    if (!config || config.userId !== user.id) {
      return res.status(404).json({ error: 'Config not found' });
    }

    // Устанавливаем headers для скачивания файла
    const filename = config.name
      .replace(/[^a-zA-Z0-9_=+.-]/g, '-')
      .replace(/(-{2,}|-$)/g, '-')
      .replace(/-$/, '')
      .substring(0, 32);

    res.setHeader('Content-Disposition', `attachment; filename="${filename || id}.conf"`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(config.configData);
  } catch (error) {
    console.error('Error in GET /configs/:id/download:', error);
    res.status(500).json({ error: 'Failed to download config' });
  }
});

/**
 * DELETE /api/configs/:id
 * Удалить конфиг из БД и WireGuard
 */
router.delete('/:id', validateTelegramWebApp, async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    const { id } = req.params;

    // Получаем пользователя из БД
    const user = await getOrCreateUser(telegramUser);

    // Получаем конфиг из БД и проверяем принадлежность
    const config = await databaseService.getConfigById(id);

    if (!config || config.userId !== user.id) {
      return res.status(404).json({ error: 'Config not found' });
    }

    // Удаляем из WireGuard
    if (config.wireguardId) {
      try {
        await wireguardService.deleteClient(config.wireguardId);
      } catch (error) {
        console.error('Failed to delete from WireGuard:', error);
        // Продолжаем удаление из БД даже если WireGuard не удалось
      }
    }

    // Удаляем из БД
    await databaseService.deleteConfig(id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /configs/:id:', error);
    res.status(500).json({ error: 'Failed to delete config' });
  }
});

/**
 * POST /api/configs/:id/disable
 * Деактивировать конфиг в БД и WireGuard
 */
router.post('/:id/disable', validateTelegramWebApp, async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    const { id } = req.params;

    // Получаем пользователя из БД
    const user = await getOrCreateUser(telegramUser);

    // Получаем конфиг из БД и проверяем принадлежность
    const config = await databaseService.getConfigById(id);

    if (!config || config.userId !== user.id) {
      return res.status(404).json({ error: 'Config not found' });
    }

    // Деактивируем в WireGuard
    if (config.wireguardId) {
      try {
        await wireguardService.disableClient(config.wireguardId);
      } catch (error) {
        console.error('Failed to disable in WireGuard:', error);
      }
    }

    // Деактивируем в БД
    await databaseService.disableConfig(id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error in POST /configs/:id/disable:', error);
    res.status(500).json({ error: 'Failed to disable config' });
  }
});

export default router;
