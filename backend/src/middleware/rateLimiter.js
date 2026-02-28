import rateLimit from 'express-rate-limit';

/**
 * Rate limiter для API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // лимит 100 запросов с одного IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Строгий rate limiter для создания конфигов
 */
export const createConfigLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 5, // лимит 5 запросов в минуту
  message: 'Too many config creation requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
