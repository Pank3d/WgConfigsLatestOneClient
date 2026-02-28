import databaseService from './databaseService.js';
import { config } from '../config/env.js';

/**
 * Подсчитывает количество конфигов пользователя
 * @param {Object} user - Объект пользователя
 * @returns {Promise<number>} Количество конфигов
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
 * @param {Object} user - Объект пользователя
 * @returns {Promise<boolean>} true если можно создать конфиг
 */
export async function canCreateConfig(user) {
  try {
    const count = await getUserConfigCount(user);
    return count < config.limits.maxConfigsPerUser;
  } catch (error) {
    console.error('Error checking if user can create config:', error);
    return false;
  }
}

/**
 * Возвращает максимальное количество конфигов на пользователя
 * @returns {number}
 */
export function getMaxConfigsPerUser() {
  return config.limits.maxConfigsPerUser;
}

/**
 * Получить или создать пользователя в БД
 * @param {Object} telegramUser - Объект пользователя из Telegram
 * @returns {Promise<Object>} Пользователь из БД
 */
export async function getOrCreateUser(telegramUser) {
  return await databaseService.findOrCreateUser(telegramUser);
}
