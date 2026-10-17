const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const filesRoutes = require('./routes/files.routes');
const errorHandler = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');

function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.clientUrl }));
  app.use(express.json({ limit: '1mb' }));
  app.use(generalLimiter);

  app.get('/health', (req, res) => {
    res.json({ success: true, data: { status: 'ok' }, message: 'Healthy' });
  });

  app.use('/api/files', filesRoutes);

  app.use((req, res) => {
    res.status(404).json({ success: false, data: null, message: 'Not found' });
  });

  app.use(errorHandler);
  return app;
}

module.exports = createApp;
