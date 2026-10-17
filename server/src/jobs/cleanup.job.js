const cron = require('node-cron');
const constants = require('../config/constants');
const { removeExpiredShares } = require('../services/share.service');
const logger = require('../utils/logger');

function startCleanupJob() {
  cron.schedule(constants.CRON_SCHEDULE, async () => {
    try {
      const removed = await removeExpiredShares();
      if (removed > 0) logger.info(`Cleanup removed ${removed} shares`);
    } catch (err) {
      logger.error('Cleanup job failed', err.message);
    }
  });
}

module.exports = startCleanupJob;
