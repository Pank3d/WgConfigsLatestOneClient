import crypto from 'crypto';
import { config } from '../config/env.js';

/**
 * Проверяет подпись Telegram Web App initData
 * @param {string} initData - Строка initData от Telegram
 * @returns {{ valid: boolean, user?: Object }} Результат валидации
 */
export function validateTelegramInitData(initData) {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) {
      return { valid: false };
    }

    urlParams.delete('hash');

    // Создаем строку для проверки подписи
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаем секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.telegram.botToken)
      .digest();

    // Вычисляем хеш
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return { valid: false };
    }

    // Парсим user из initData
    const userParam = urlParams.get('user');
    if (!userParam) {
      return { valid: false };
    }

    const user = JSON.parse(userParam);

    return {
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    };
  } catch (error) {
    console.error('Error validating Telegram initData:', error);
    return { valid: false };
  }
}
