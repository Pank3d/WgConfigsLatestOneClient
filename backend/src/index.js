import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();

// Trust proxy (за Nginx)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'WireGuard VPN Telegram Mini App API',
    version: '1.0.0',
  });
});

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import configsRoutes from './routes/configs.js';
import webhookRoutes, { setupWebhook } from './routes/webhook.js';
import paymentsRoutes from './routes/payments.js';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/configs', configsRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/payments', paymentsRoutes);

// Error handler (должен быть последним)
app.use(errorHandler);

// Start server
app.listen(config.port, async () => {
  console.log('='.repeat(80));
  console.log('✅ Backend API Server is running');
  console.log('='.repeat(80));
  console.log(`🚀 Server listening on port ${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`📡 WireGuard API URL: ${config.wireguard.apiUrl}`);
  console.log('='.repeat(80));

  // Setup webhook for Telegram
  await setupWebhook();
});

export default app;
