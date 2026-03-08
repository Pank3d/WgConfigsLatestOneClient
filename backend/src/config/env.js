import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),

  telegram: {
    botToken: process.env.BOT_TOKEN || '',
    channelId: process.env.CHANNEL_ID || '@wireguardvpntop',
    webhookUrl: process.env.WEBHOOK_URL || '',
    webhookSecret: process.env.WEBHOOK_SECRET || '',
  },

  wireguard: {
    apiUrl: process.env.WIREGUARD_API_URL || 'http://localhost:500',
  },

  limits: {
    maxConfigsPerUser: parseInt(process.env.MAX_CONFIGS_PER_USER || '3', 10),
  },

  yookassa: {
    shopId: process.env.YOOKASSA_SHOP_ID || '',
    secretKey: process.env.YOOKASSA_SECRET_KEY || '',
    returnUrl: process.env.YOOKASSA_RETURN_URL || 'https://wgshoppr.ru',
  },
};
