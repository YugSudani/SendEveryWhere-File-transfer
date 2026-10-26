const cron = require('node-cron');
const constants = require('../config/constants');
const { removeExpiredShares } = require('../services/share.service');

let running = false;

/**
 * The ONLY thing that deletes shares. For each expired share it deletes the
 * bucket objects first (verified), then the DB record.
 */
async function runOnce() {
  if (running) {
    console.log('[cron] tick skipped: previous run still in progress');
    return;
  }
  running = true;
  const startedAt = new Date().toISOString();
  try {
    const { found, removed } = await removeExpiredShares();
    if (found === 0) {
      console.log(`[cron] ${startedAt}: nothing expired`);
    } else {
      console.log(`[cron] ${startedAt}: expired ${found}, fully removed ${removed}`);
    }
  } catch (err) {
    console.error(`[cron] FAILED at ${startedAt}: ${err.message}\n${err.stack}`);
  } finally {
    running = false;
  }
}

function startCleanupJob() {
  // Once at startup: recovers shares that expired while the server was down.
  console.log(`[cron] registered with schedule "${constants.CRON_SCHEDULE}", running once now`);
  runOnce();
  cron.schedule(constants.CRON_SCHEDULE, runOnce);
}

module.exports = startCleanupJob;
