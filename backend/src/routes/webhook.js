import express from 'express';
import { Telegraf } from 'telegraf';
import { config } from '../config/env.js';
import wireguardService from '../services/wireguardService.js';
import databaseService from '../services/databaseService.js';

const router = express.Router();
const bot = new Telegraf(config.telegram.botToken);

const CHANNEL_ID = config.telegram.channelId.replace('@', '');

/**
 * Функция обработки отписки пользователя
 */
async function handleUnsubscribe(user) {
  try {
    console.log('\n' + '🚨'.repeat(40));
    console.log(`🚨 User ${user.first_name} (${user.id}) unsubscribed`);
    console.log('🚨'.repeat(40));

    // Получаем пользователя из БД
    const dbUser = await databaseService.getUserByTelegramId(user.id);

    if (!dbUser) {
      console.log('User not found in database');
      console.log('🚨'.repeat(40) + '\n');
      return;
    }

    // Получаем все конфиги пользователя из БД
    const userConfigs = await databaseService.getUserConfigs(dbUser.id);

    console.log(`Found ${userConfigs.length} configs for user ${user.id}`);

    // Деактивируем все конфиги
    for (const config of userConfigs) {
      try {
        // Деактивируем в WireGuard
        if (config.wireguardId) {
          await wireguardService.disableClient(config.wireguardId);
        }
        // Деактивируем в БД
        await databaseService.disableConfig(config.id);
        console.log(`✅ Disabled config: ${config.name} (${config.id})`);
      } catch (error) {
        console.error(`❌ Failed to disable config ${config.id}:`, error);
      }
    }

    console.log('🚨'.repeat(40) + '\n');
  } catch (error) {
    console.error('Error in handleUnsubscribe:', error);
  }
}

// Настройка обработчика chat_member
bot.on('chat_member', async (ctx) => {
  try {
    const update = ctx.update.chat_member;
    const oldStatus = update.old_chat_member.status;
    const newStatus = update.new_chat_member.status;
    const user = update.from;
    const chat = update.chat;

    // Проверяем, что событие от нужного канала
    if (chat.username !== CHANNEL_ID) {
      return;
    }

    // Проверяем отписку
    const wasSubscribed = ['member', 'administrator', 'creator'].includes(oldStatus);
    const isUnsubscribed = ['left', 'kicked'].includes(newStatus);

    if (wasSubscribed && isUnsubscribed) {
      await handleUnsubscribe(user);
    }
  } catch (error) {
    console.error('Error in chat_member handler:', error);
  }
});

/**
 * POST /api/webhook/chat-member
 * Webhook endpoint для обработки Telegram updates
 */
router.post('/chat-member', async (req, res) => {
  try {
    // Проверка секретного токена (опционально)
    const secret = req.headers['x-telegram-bot-api-secret-token'];
    if (config.telegram.webhookSecret && secret !== config.telegram.webhookSecret) {
      return res.status(403).json({ error: 'Invalid secret token' });
    }

    // Обрабатываем update через Telegraf
    await bot.handleUpdate(req.body);

    res.json({ ok: true });
  } catch (error) {
    console.error('Error in webhook handler:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Настройка webhook (вызывается при старте сервера)
 */
export async function setupWebhook() {
  try {
    if (!config.telegram.webhookUrl) {
      console.warn('⚠️  WEBHOOK_URL not set, webhook not configured');
      return;
    }

    const webhookUrl = `${config.telegram.webhookUrl}/api/webhook/chat-member`;

    await bot.telegram.setWebhook(webhookUrl, {
      allowed_updates: ['chat_member'],
      ...(config.telegram.webhookSecret && {
        secret_token: config.telegram.webhookSecret,
      }),
    });

    console.log('✅ Webhook configured:', webhookUrl);
    console.log('📢 Tracking unsubscriptions from channel:', config.telegram.channelId);
  } catch (error) {
    console.error('❌ Failed to setup webhook:', error);
  }
}

export default router;
