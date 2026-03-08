import { hasActiveSubscription } from '../services/paymentService.js';
import { getOrCreateUser } from '../services/userService.js';

/**
 * Middleware для проверки активной подписки
 * Блокирует создание и скачивание конфигов без подписки
 */
export async function requireSubscription(req, res, next) {
  try {
    const telegramUser = req.telegramUser;
    if (!telegramUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getOrCreateUser(telegramUser);
    const active = await hasActiveSubscription(user.id);

    if (!active) {
      return res.status(403).json({
        error: 'Требуется активная подписка',
        code: 'SUBSCRIPTION_REQUIRED',
      });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
