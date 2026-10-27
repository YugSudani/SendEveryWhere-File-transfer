const os = require('os');
const mongoose = require('mongoose');
const env = require('./config/env');
const constants = require('./config/constants');
const connectDb = require('./config/db');
const createApp = require('./app');
const startCleanupJob = require('./jobs/cleanup.job');
const startSweeperJob = require('./jobs/sweeper.job');
const logger = require('./utils/logger');

async function main() {
  await connectDb(env.mongoUri);

  // If two servers ever run against the same DB/bucket you will see two
  // different instance ids in the logs.
  logger.info(
    `[boot] instance=${os.hostname()}:${process.pid} env=${env.nodeEnv} ` +
      `db="${mongoose.connection.name}" bucket="${env.filebase.bucket}" ` +
      `prefix="${env.filebase.keyPrefix}" expiry=${constants.EXPIRY_MINUTES}min ` +
      `uploadWindow=${constants.UPLOAD_WINDOW_MINUTES}min verifyDelete=${env.filebase.verifyDelete}`
  );

  startCleanupJob();
  startSweeperJob();
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
