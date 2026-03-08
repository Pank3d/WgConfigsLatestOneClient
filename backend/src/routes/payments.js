import express from 'express';
import { validateTelegramWebApp } from '../middleware/telegramAuth.js';
import { getOrCreateUser } from '../services/userService.js';
import {
  PLANS,
  EXTRA_CONFIG_PRICE,
  getSubscriptionInfo,
  activateSubscription,
  addExtraConfig,
} from '../services/paymentService.js';
import databaseService from '../services/databaseService.js';

const router = express.Router();

/**
 * GET /api/payments/plans
 * Получить доступные тарифы
 */
router.get('/plans', (req, res) => {
  res.json({
    plans: Object.values(PLANS),
    extraConfigPrice: EXTRA_CONFIG_PRICE,
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

    if (type === 'SUBSCRIPTION') {
      if (!plan || !PLANS[plan]) {
        return res.status(400).json({ error: 'Неверный тариф' });
      }

      const amount = PLANS[plan].price;

      // TODO: Интеграция с ЮКассой
      // const payment = await yookassa.createPayment(...)
      // Пока создаём заглушку
      const paymentId = `test_${Date.now()}`;

      await databaseService.createPayment({
        userId: user.id,
        yookassaPaymentId: paymentId,
        amount,
        type: 'SUBSCRIPTION',
        plan,
        description: `Подписка WireGuard VPN — ${PLANS[plan].name}`,
      });

      res.json({
        paymentId,
        confirmationUrl: null, // Будет URL от ЮКассы
        amount,
        description: `Подписка WireGuard VPN — ${PLANS[plan].name}`,
      });
    } else if (type === 'EXTRA_CONFIG') {
      const paymentId = `test_extra_${Date.now()}`;

      await databaseService.createPayment({
        userId: user.id,
        yookassaPaymentId: paymentId,
        amount: EXTRA_CONFIG_PRICE,
        type: 'EXTRA_CONFIG',
        description: 'Дополнительный конфиг',
      });

      res.json({
        paymentId,
        confirmationUrl: null,
        amount: EXTRA_CONFIG_PRICE,
        description: 'Дополнительный конфиг',
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

      // Обновляем статус платежа
      await databaseService.updatePaymentStatus(yookassaPaymentId, 'SUCCEEDED');

      // Активируем подписку или добавляем конфиг
      if (payment.type === 'SUBSCRIPTION' && payment.plan) {
        const sub = await activateSubscription(payment.userId, payment.plan);
        await databaseService.updatePaymentStatus(yookassaPaymentId, 'SUCCEEDED');
        if (sub) {
          await databaseService.createPayment({
            ...payment,
            subscriptionId: sub.id,
          }).catch(() => {}); // Ignore if already linked
        }
      } else if (payment.type === 'EXTRA_CONFIG') {
        await addExtraConfig(payment.userId);
      }
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
