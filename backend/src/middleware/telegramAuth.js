import { validateTelegramInitData } from '../utils/telegramValidator.js';

/**
 * Middleware для валидации Telegram Web App initData
 */
export function validateTelegramWebApp(req, res, next) {
  const initData = req.headers['x-init-data'];

  if (!initData) {
    return res.status(401).json({ error: 'No initData provided' });
  }

  const result = validateTelegramInitData(initData);

  if (!result.valid) {
    return res.status(401).json({ error: 'Invalid initData' });
  }

  // Прикрепляем пользователя к запросу
  req.telegramUser = result.user;

  next();
}
