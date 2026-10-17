const env = require('./env');

const constants = {
  CODE_LENGTH: 6,
  CODE_MIN: 100000,
  CODE_MAX: 999999,
  CODE_MAX_RETRIES: 10,
  EXPIRY_MINUTES: env.expiryMinutes,
  MAX_FILE_SIZE_MB: env.maxFileSizeMb,
  MAX_FILE_SIZE_BYTES: env.maxFileSizeMb * 1024 * 1024,
  MAX_FILES_COUNT: env.maxFilesCount,
  UPLOAD_DIR: env.uploadDir,
  CRON_SCHEDULE: '*/1 * * * *',
  ZIP_PREFIX: 'files-',
};

module.exports = constants;
