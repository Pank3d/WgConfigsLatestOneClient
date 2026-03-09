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

  // === Subscription methods ===

  /**
   * Получить активную подписку пользователя
   */
  async getActiveSubscription(userId) {
    return await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gt: new Date() },
      },
      orderBy: { endDate: 'desc' },
    });
  }

  /**
   * Создать подписку
   */
  async createSubscription(userId, plan, endDate, maxConfigs = 3, extraConfigs = 0) {
    return await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: 'ACTIVE',
        endDate,
        maxConfigs,
        extraConfigs,
      },
    });
  }

  /**
   * Обновить подписку
   */
  async updateSubscription(subscriptionId, data) {
    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data,
    });
  }

  /**
   * Пометить просроченные подписки
   */
  async expireSubscriptions() {
    return await prisma.subscription.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: { lte: new Date() },
      },
      data: { status: 'EXPIRED' },
    });
  }

  /**
   * Получить подписки которые истекли но ещё в статусе ACTIVE
   * (для cron-задачи отключения конфигов)
   */
  async getNewlyExpiredSubscriptions() {
    return await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { lte: new Date() },
      },
    });
  }

  // === Payment methods ===

  /**
   * Создать запись о платеже
   */
  async createPayment(data) {
    return await prisma.payment.create({ data });
  }

  /**
   * Найти платёж по ID ЮКассы
   */
  async getPaymentByYookassaId(yookassaPaymentId) {
    return await prisma.payment.findUnique({
      where: { yookassaPaymentId },
    });
  }

  /**
   * Обновить статус платежа
   */
  async updatePaymentStatus(yookassaPaymentId, status) {
    return await prisma.payment.update({
      where: { yookassaPaymentId },
      data: { status },
    });
  }

  /**
   * Получить историю платежей пользователя
   */
  async getUserPayments(userId) {
    return await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new DatabaseService();
export { prisma };
