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

  featureFlags: {
    freeAntiglusch: true, // TODO: убрать после тестов
  },

  xray: {
    panelUrl: process.env.XRAY_PANEL_URL || 'http://xray-panel:2053',
    panelUsername: process.env.XRAY_PANEL_USERNAME || 'admin',
    panelPassword: process.env.XRAY_PANEL_PASSWORD || 'admin',
    inboundId: 1,
    serverAddress: '193.242.109.212',
    serverPort: 8443,
    realitySni: 'yandex.ru',
    realityFingerprint: 'qq',
  },
};
