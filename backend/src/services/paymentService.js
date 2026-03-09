import databaseService from './databaseService.js';

// Тарифные планы
export const PLANS = {
  MONTHLY: {
    id: 'MONTHLY',
    name: '1 месяц',
    price: 150,
    duration: 1, // месяцев
    configs: 3,
  },
  QUARTERLY: {
    id: 'QUARTERLY',
    name: '3 месяца',
    price: 400,
    duration: 3,
    configs: 3,
  },
  YEARLY: {
    id: 'YEARLY',
    name: '1 год',
    price: 1500,
    duration: 12,
    configs: 3,
  },
};

export const EXTRA_CONFIG_PRICE = 50; // рублей в месяц

/**
 * Рассчитать дату окончания подписки
 */
function calculateEndDate(plan) {
  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + PLANS[plan].duration);
  return end;
}

/**
 * Проверить активную подписку пользователя
 */
export async function getActiveSubscription(userId) {
  // Помечаем просроченные
  await databaseService.expireSubscriptions();
  return await databaseService.getActiveSubscription(userId);
}

/**
 * Проверить, есть ли у пользователя активная подписка
 */
export async function hasActiveSubscription(userId) {
  const sub = await getActiveSubscription(userId);
  return !!sub;
}

/**
 * Получить максимум конфигов для пользователя с учётом подписки
 */
export async function getMaxConfigsForUser(userId) {
  const sub = await getActiveSubscription(userId);
  if (!sub) return 0; // без подписки — 0 конфигов
  return sub.maxConfigs + sub.extraConfigs;
}

/**
 * Получить информацию о подписке для API-ответа
 */
export async function getSubscriptionInfo(userId) {
  const sub = await getActiveSubscription(userId);
  if (!sub) {
    return {
      active: false,
      plan: null,
      endDate: null,
      maxConfigs: 0,
      extraConfigs: 0,
    };
  }
  return {
    active: true,
    plan: sub.plan,
    endDate: sub.endDate.toISOString(),
    maxConfigs: sub.maxConfigs,
    extraConfigs: sub.extraConfigs,
  };
}

/**
 * Активировать подписку после успешной оплаты
 * (вызывается из webhook ЮКассы)
 */
export async function activateSubscription(userId, plan) {
  const endDate = calculateEndDate(plan);

  // Проверяем есть ли активная подписка — продлеваем от конца текущей
  const existing = await databaseService.getActiveSubscription(userId);
  if (existing) {
    const newEnd = new Date(existing.endDate);
    newEnd.setMonth(newEnd.getMonth() + PLANS[plan].duration);
    return await databaseService.updateSubscription(existing.id, {
      endDate: newEnd,
      plan,
    });
  }

  return await databaseService.createSubscription(userId, plan, endDate);
}

/**
 * Добавить дополнительный конфиг к подписке
 */
export async function addExtraConfig(userId) {
  const sub = await databaseService.getActiveSubscription(userId);
  if (!sub) {
    throw new Error('Нет активной подписки');
  }
  return await databaseService.updateSubscription(sub.id, {
    extraConfigs: sub.extraConfigs + 1,
  });
}
