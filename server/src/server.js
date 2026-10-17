const mongoose = require('mongoose');
const env = require('./config/env');
const connectDb = require('./config/db');
const createApp = require('./app');
const startCleanupJob = require('./jobs/cleanup.job');
const logger = require('./utils/logger');

async function main() {
  await connectDb(env.mongoUri);
  startCleanupJob();
  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port}`);
  });

  function shutdown(signal) {
    logger.info(`Received ${signal}, shutting down`);
    server.close(async () => {
      try {
        await mongoose.connection.close();
      } finally {
        process.exit(0);
      }
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
