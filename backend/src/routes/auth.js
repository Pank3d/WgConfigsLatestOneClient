import express from 'express';
import { validateTelegramInitData } from '../utils/telegramValidator.js';

const router = express.Router();

/**
 * POST /api/auth/verify
 * Проверяет валидность Telegram initData и возвращает информацию о пользователе
 */
router.post('/verify', (req, res) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'initData is required' });
    }

    const result = validateTelegramInitData(initData);

    if (!result.valid) {
      return res.status(401).json({ error: 'Invalid initData' });
    }

    res.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    console.error('Error in /auth/verify:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
