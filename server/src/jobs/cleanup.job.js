const cron = require('node-cron');
const constants = require('../config/constants');
const shareService = require('../services/share.service');
const logger = require('../utils/logger');

function startCleanupJob() {
  cron.schedule(constants.CRON_SCHEDULE, async () => {
    // Expiry is driven by the cron job, not by the MongoDB TTL index: only this
    // path also deletes the stored files, which a TTL index cannot do.
    try {
      const removed = await shareService.removeExpiredShares();
      if (removed > 0) logger.info(`Cleanup removed ${removed} expired shares`);
    } catch (err) {
      logger.error('Expired-share cleanup failed', err.message);
    }

    // Run after the expiry pass so files that are still referenced by a
    // just-deleted share are not counted as orphans here.
    try {
      const orphans = await shareService.removeOrphanFiles();
      if (orphans > 0) logger.warn(`Cleanup removed ${orphans} orphaned files`);
    } catch (err) {
      logger.error('Orphan-file sweep failed', err.message);
    }
  });
}

module.exports = startCleanupJob;
