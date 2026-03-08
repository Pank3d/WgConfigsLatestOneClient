import databaseService from './databaseService.js';
import { config } from '../config/env.js';
import { getMaxConfigsForUser } from './paymentService.js';

/**
 * Подсчитывает количество конфигов пользователя
 */
export async function getUserConfigCount(user) {
  try {
    const dbUser = await databaseService.getUserByTelegramId(user.id);
    if (!dbUser) return 0;

    return await databaseService.countUserConfigs(dbUser.id);
  } catch (error) {
    console.error('Error counting user configs:', error);
    return 0;
  }
}

/**
 * Проверяет, может ли пользователь создать новый конфиг
 * Учитывает подписку и доп. конфиги
 */
export async function canCreateConfig(user) {
  try {
    const dbUser = await databaseService.getUserByTelegramId(user.id);
    if (!dbUser) return false;

    const count = await databaseService.countUserConfigs(dbUser.id);
    const maxConfigs = await getMaxConfigsForUser(dbUser.id);
    return count < maxConfigs;
  } catch (error) {
    console.error('Error checking if user can create config:', error);
    return false;
  }
}

/**
 * Возвращает максимальное количество конфигов на пользователя
 * Учитывает подписку
 */
export async function getMaxConfigsPerUser(telegramUser) {
  try {
    if (telegramUser) {
      const dbUser = await databaseService.getUserByTelegramId(telegramUser.id || telegramUser);
      if (dbUser) {
        return await getMaxConfigsForUser(dbUser.id);
      }
    }
    return 0;
  } catch (error) {
    return config.limits.maxConfigsPerUser;
  }
}

/**
 * Получить или создать пользователя в БД
 */
export async function getOrCreateUser(telegramUser) {
  return await databaseService.findOrCreateUser(telegramUser);
}
