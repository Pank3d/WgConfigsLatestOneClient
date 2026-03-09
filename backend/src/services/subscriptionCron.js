import databaseService from './databaseService.js';
import wireguardService from './wireguardService.js';
import xrayService from './xrayService.js';

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 минут

/**
 * Проверяет просроченные подписки и отключает конфиги на WireGuard
 */
async function checkExpiredSubscriptions() {
  try {
    // Находим подписки которые только что истекли (ещё ACTIVE но endDate в прошлом)
    const expired = await databaseService.getNewlyExpiredSubscriptions();

    if (expired.length === 0) return;

    console.log(`[CRON] Found ${expired.length} expired subscriptions`);

    for (const subscription of expired) {
      try {
        // Получаем все активные конфиги пользователя
        const configs = await databaseService.getUserConfigs(subscription.userId);
        const enabledConfigs = configs.filter((c) => c.enabled);

        // Отключаем каждый конфиг на WireGuard
        for (const config of enabledConfigs) {
          if (config.wireguardId) {
            try {
              await wireguardService.disableClient(config.wireguardId);
              console.log(`[CRON] Disabled WG client ${config.wireguardId} for user ${subscription.userId}`);
            } catch (err) {
              console.error(`[CRON] Failed to disable WG client ${config.wireguardId}:`, err.message);
            }
          }
          await databaseService.disableConfig(config.id);
        }

        // Отключаем AntiGlusch конфиги
        const agConfigs = await databaseService.getUserAntigluschConfigs(subscription.userId);
        const enabledAgConfigs = agConfigs.filter((c) => c.enabled);

        for (const agConfig of enabledAgConfigs) {
          if (agConfig.xrayClientId && agConfig.xrayEmail) {
            try {
              await xrayService.disableClient(agConfig.xrayClientId, agConfig.xrayEmail);
              console.log(`[CRON] Disabled Xray client ${agConfig.xrayClientId} for user ${subscription.userId}`);
            } catch (err) {
              console.error(`[CRON] Failed to disable Xray client ${agConfig.xrayClientId}:`, err.message);
            }
          }
          await databaseService.disableAntigluschConfig(agConfig.id);
        }

        // Помечаем подписку как EXPIRED
        await databaseService.updateSubscription(subscription.id, { status: 'EXPIRED' });
        console.log(`[CRON] Expired subscription ${subscription.id} for user ${subscription.userId}, disabled ${enabledConfigs.length} WG + ${enabledAgConfigs.length} AG configs`);
      } catch (err) {
        console.error(`[CRON] Error processing subscription ${subscription.id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('[CRON] Error checking expired subscriptions:', error.message);
  }
}

/**
 * Запускает периодическую проверку подписок
 */
export function startSubscriptionCron() {
  console.log(`[CRON] Subscription checker started (interval: ${CHECK_INTERVAL / 1000}s)`);

  // Первая проверка через 10 секунд после старта
  setTimeout(checkExpiredSubscriptions, 10000);

  // Далее каждые 5 минут
  setInterval(checkExpiredSubscriptions, CHECK_INTERVAL);
}
