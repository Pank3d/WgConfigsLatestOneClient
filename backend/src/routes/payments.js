import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validateTelegramWebApp } from '../middleware/telegramAuth.js';
import { getOrCreateUser } from '../services/userService.js';
import {
  PLANS,
  EXTRA_CONFIG_PRICE,
  EXTRA_ANTIGLUSCH_CONFIG_PRICE,
  getSubscriptionInfo,
  activateSubscription,
  addExtraConfig,
  addExtraAntigluschConfig,
} from '../services/paymentService.js';
import databaseService from '../services/databaseService.js';
import { config } from '../config/env.js';

/**
 * Создать платёж через ЮКасса API
 */
async function createYookassaPayment({ amount, description, returnUrl, metadata }) {
  const { shopId, secretKey } = config.yookassa;
  const idempotenceKey = uuidv4();

  const body = JSON.stringify({
    amount: {
      value: amount.toFixed(2),
      currency: 'RUB',
    },
    capture: true,
    confirmation: {
      type: 'redirect',
      return_url: returnUrl,
    },
    description,
    metadata,
  });

  const credentials = Buffer.from(`${shopId}:${secretKey}`).toString('base64');

  const response = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Idempotence-Key': idempotenceKey,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`YooKassa API error ${response.status}: ${err}`);
  }

  return await response.json();
}

const router = express.Router();

/**
 * GET /api/payments/plans
 * Получить доступные тарифы
 */
router.get('/plans', (req, res) => {
  res.json({
    plans: Object.values(PLANS),
    extraConfigPrice: EXTRA_CONFIG_PRICE,
    extraAntigluschConfigPrice: EXTRA_ANTIGLUSCH_CONFIG_PRICE,
  });
});

/**
 * GET /api/payments/subscription
 * Получить статус подписки текущего пользователя
 */
router.get('/subscription', validateTelegramWebApp, async (req, res) => {
  try {
    const user = await getOrCreateUser(req.telegramUser);
    const info = await getSubscriptionInfo(user.id);
    res.json(info);
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({ error: 'Failed to get subscription info' });
  }
});

/**
 * POST /api/payments/create
 * Создать платёж (заготовка для ЮКассы — пока возвращает URL-заглушку)
 */
router.post('/create', validateTelegramWebApp, async (req, res) => {
  try {
    const user = await getOrCreateUser(req.telegramUser);
    const { plan, type = 'SUBSCRIPTION' } = req.body;

    const returnUrl = config.yookassa.returnUrl;

    if (type === 'SUBSCRIPTION') {
      if (!plan || !PLANS[plan]) {
        return res.status(400).json({ error: 'Неверный тариф' });
      }

      const amount = PLANS[plan].price;
      const description = `Подписка WireGuard VPN — ${PLANS[plan].name}`;

      const ykPayment = await createYookassaPayment({
        amount,
        description,
        returnUrl,
        metadata: { userId: user.id, type: 'SUBSCRIPTION', plan },
      });

      await databaseService.createPayment({
        userId: user.id,
        yookassaPaymentId: ykPayment.id,
        amount,
        type: 'SUBSCRIPTION',
        plan,
        description,
      });

      res.json({
        paymentId: ykPayment.id,
        confirmationUrl: ykPayment.confirmation.confirmation_url,
        amount,
        description,
      });
    } else if (type === 'EXTRA_CONFIG') {
      const description = 'Дополнительный WireGuard конфиг';

      const ykPayment = await createYookassaPayment({
        amount: EXTRA_CONFIG_PRICE,
        description,
        returnUrl,
        metadata: { userId: user.id, type: 'EXTRA_CONFIG' },
      });

      await databaseService.createPayment({
        userId: user.id,
        yookassaPaymentId: ykPayment.id,
        amount: EXTRA_CONFIG_PRICE,
        type: 'EXTRA_CONFIG',
        description,
      });

      res.json({
        paymentId: ykPayment.id,
        confirmationUrl: ykPayment.confirmation.confirmation_url,
        amount: EXTRA_CONFIG_PRICE,
        description,
      });
    } else if (type === 'EXTRA_ANTIGLUSCH_CONFIG') {
      const description = 'Дополнительный AntiGlusch конфиг';

      const ykPayment = await createYookassaPayment({
        amount: EXTRA_ANTIGLUSCH_CONFIG_PRICE,
        description,
        returnUrl,
        metadata: { userId: user.id, type: 'EXTRA_ANTIGLUSCH_CONFIG' },
      });

      await databaseService.createPayment({
        userId: user.id,
        yookassaPaymentId: ykPayment.id,
        amount: EXTRA_ANTIGLUSCH_CONFIG_PRICE,
        type: 'EXTRA_ANTIGLUSCH_CONFIG',
        description,
      });

      res.json({
        paymentId: ykPayment.id,
        confirmationUrl: ykPayment.confirmation.confirmation_url,
        amount: EXTRA_ANTIGLUSCH_CONFIG_PRICE,
        description,
      });
    } else {
      return res.status(400).json({ error: 'Неверный тип платежа' });
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

/**
 * POST /api/payments/webhook
 * Webhook от ЮКассы (обработка подтверждения оплаты)
 */
router.post('/webhook', async (req, res) => {
  try {
    const { event, object } = req.body;

    if (event === 'payment.succeeded') {
      const yookassaPaymentId = object?.id;
      if (!yookassaPaymentId) {
        return res.status(400).json({ error: 'Invalid webhook payload' });
      }

      const payment = await databaseService.getPaymentByYookassaId(yookassaPaymentId);
      if (!payment) {
        console.warn('Payment not found:', yookassaPaymentId);
        return res.status(200).json({ ok: true });
      }

      // Активируем подписку или добавляем конфиг
      if (payment.type === 'SUBSCRIPTION' && payment.plan) {
        await activateSubscription(payment.userId, payment.plan);
      } else if (payment.type === 'EXTRA_CONFIG') {
        await addExtraConfig(payment.userId);
      } else if (payment.type === 'EXTRA_ANTIGLUSCH_CONFIG') {
        await addExtraAntigluschConfig(payment.userId);
      }

      // Обновляем статус платежа
      await databaseService.updatePaymentStatus(yookassaPaymentId, 'SUCCEEDED');
      console.log(`[Webhook] Payment ${yookassaPaymentId} succeeded, type=${payment.type}`);
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ ok: true }); // Всегда 200 для ЮКассы
  }
});

/**
 * GET /api/payments/history
 * История платежей пользователя
 */
router.get('/history', validateTelegramWebApp, async (req, res) => {
  try {
    const user = await getOrCreateUser(req.telegramUser);
    const payments = await databaseService.getUserPayments(user.id);
    res.json({ payments });
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
});

export default router;
