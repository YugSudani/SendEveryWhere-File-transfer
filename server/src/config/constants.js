const env = require('./env');

const constants = {
  CODE_LENGTH: 6,
  CODE_MIN: 100000,
  CODE_MAX: 999999,
  CODE_MAX_RETRIES: 10,
  EXPIRY_MINUTES: env.expiryMinutes,
  EXPIRY_SECONDS: env.expiryMinutes * 60,
  // Mongo's TTL monitor runs roughly every 60s and drops documents with no hook
  // for storage cleanup, so it would race the cron job and orphan files. The
  // cron is the source of truth for expiry (it deletes files *and* the doc);
  // the TTL gets a full EXPIRY_MINUTES grace period so it never preempts it and
  // only sweeps up docs the app missed (e.g. server was down).
  TTL_GRACE_SECONDS: env.expiryMinutes * 60,
  // Never treat an upload-dir file as an orphan until it is at least this old,
  // so an in-flight upload whose document has not been written yet is spared.
  ORPHAN_MIN_AGE_MS: env.expiryMinutes * 60 * 1000,
  MAX_FILE_SIZE_MB: env.maxFileSizeMb,
  MAX_FILE_SIZE_BYTES: env.maxFileSizeMb * 1024 * 1024,
  MAX_FILES_COUNT: env.maxFilesCount,
  UPLOAD_DIR: env.uploadDir,
  CRON_SCHEDULE: '*/1 * * * *',
  ZIP_PREFIX: 'files-',
};

module.exports = constants;
