require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const path = require('path');

const isProd = (process.env.NODE_ENV || 'development') === 'production';

const mongoUri = (process.env.MONGO_URI || '').trim();

// In production we must NOT silently fall back to a local MongoDB that doesn't exist.
if (!mongoUri && isProd) {
  throw new Error(
    'MONGO_URI is not set. Configure it in your deployment environment (see server/.env.example).'
  );
}

const resolvedUploadDir = process.env.UPLOAD_DIR
  ? path.isAbsolute(process.env.UPLOAD_DIR)
    ? process.env.UPLOAD_DIR
    : path.join(__dirname, '..', '..', process.env.UPLOAD_DIR)
  : path.join(__dirname, '..', '..', 'uploads');

const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: mongoUri || 'mongodb://localhost:27017/send-everywhere',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10),
  maxFilesCount: parseInt(process.env.MAX_FILES_COUNT || '10', 10),
  expiryMinutes: parseInt(process.env.EXPIRY_MINUTES || '10', 10),
  uploadDir: resolvedUploadDir,
  nodeEnv: process.env.NODE_ENV || 'development',
};

module.exports = env;
