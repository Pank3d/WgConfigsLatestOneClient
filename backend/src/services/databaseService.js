import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Сервис для работы с базой данных
 */
class DatabaseService {
  /**
   * Найти или создать пользователя
   */
  async findOrCreateUser(telegramUser) {
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(telegramUser.id) },
      update: {
        username: telegramUser.username,
        firstName: telegramUser.firstName,
        lastName: telegramUser.lastName,
      },
      create: {
        telegramId: BigInt(telegramUser.id),
        username: telegramUser.username,
        firstName: telegramUser.firstName,
        lastName: telegramUser.lastName,
      },
    });
    return user;
  }

  /**
   * Получить пользователя по Telegram ID
   */
  async getUserByTelegramId(telegramId) {
    return await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
      include: { configs: true },
    });
  }

  /**
   * Создать конфиг
   */
  async createConfig(userId, name, wireguardId, configData) {
    return await prisma.config.create({
      data: {
        name,
        wireguardId,
        configData,
        userId,
      },
    });
  }

  /**
   * Получить конфиги пользователя
   */
  async getUserConfigs(userId) {
    return await prisma.config.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Получить конфиг по ID
   */
  async getConfigById(configId) {
    return await prisma.config.findUnique({
      where: { id: configId },
      include: { user: true },
    });
  }

  /**
   * Удалить конфиг
   */
  async deleteConfig(configId) {
    return await prisma.config.delete({
      where: { id: configId },
    });
  }

  /**
   * Деактивировать конфиг
   */
  async disableConfig(configId) {
    return await prisma.config.update({
      where: { id: configId },
      data: { enabled: false },
    });
  }

  /**
   * Деактивировать все конфиги пользователя
   */
  async disableAllUserConfigs(userId) {
    return await prisma.config.updateMany({
      where: { userId },
      data: { enabled: false },
    });
  }

  /**
   * Подсчитать количество конфигов пользователя
   */
  async countUserConfigs(userId) {
    return await prisma.config.count({
      where: { userId },
    });
  }
}

export default new DatabaseService();
export { prisma };
