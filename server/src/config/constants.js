const env = require('./env');

const constants = {
  CODE_LENGTH: 6,
  CODE_MIN: 100000,
  CODE_MAX: 999999,
  CODE_MAX_RETRIES: 10,
  EXPIRY_MINUTES: env.expiryMinutes,
  EXPIRY_SECONDS: env.expiryMinutes * 60,
  MAX_TOTAL_SIZE_GB: env.maxTotalSizeGb,
  MAX_TOTAL_SIZE_BYTES: Math.round(env.maxTotalSizeGb * 1024 * 1024 * 1024),
  // Pending shares (upload in progress) get this longer window so an in-flight
  // upload cannot be expired out from under the sender. Completed shares use
  // EXPIRY_MINUTES instead.
  UPLOAD_WINDOW_MINUTES: env.uploadWindowMinutes,
  // Presigned URLs.
  // PUT: all URLs are signed at initiate, but files upload one after another,
  // so the last URL must still be valid when its turn comes -> same as the
  // upload window (capped at 7 days, the S3 maximum).
  PRESIGN_PUT_TTL: Math.min(env.uploadWindowMinutes * 60, 7 * 24 * 3600),
  // GET: short; the browser starts the download right away.
  PRESIGN_GET_TTL: 60,
  MAX_FILES_COUNT: env.maxFilesCount,
  CRON_SCHEDULE: '*/1 * * * *',
  SWEEPER_SCHEDULE: '*/15 * * * *',
  ZIP_PREFIX: 'files-',
};

module.exports = constants;
