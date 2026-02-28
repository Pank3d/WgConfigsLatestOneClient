import express from 'express';
import { validateTelegramWebApp } from '../middleware/telegramAuth.js';
import { getUserConfigCount, getMaxConfigsPerUser } from '../services/userService.js';
import telegramService from '../services/telegramService.js';
import { config } from '../config/env.js';

const router = express.Router();

/**
 * GET /api/user/info
 * Возвращает информацию о пользователе и его конфигах
 */
router.get('/info', validateTelegramWebApp, async (req, res) => {
  try {
    const user = req.telegramUser;

    const configCount = await getUserConfigCount(user);
    const maxConfigs = getMaxConfigsPerUser();

    res.json({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      configCount,
      maxConfigs,
    });
  } catch (error) {
    console.error('Error in /user/info:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

/**
 * GET /api/user/subscription-status
 * Проверяет подписку пользователя на канал
 */
router.get('/subscription-status', validateTelegramWebApp, async (req, res) => {
  try {
    const user = req.telegramUser;

    const isSubscribed = await telegramService.checkChannelSubscription(
      user.id,
      config.telegram.channelId
    );

    res.json({
      isSubscribed,
      channelId: config.telegram.channelId,
    });
  } catch (error) {
    console.error('Error in /user/subscription-status:', error);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});

export default router;
