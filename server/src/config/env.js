require('dotenv').config();
const path = require('path');

const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri:
    process.env.MONGO_URI || 'mongodb://localhost:27017/send-everywhere',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10),
  maxFilesCount: parseInt(process.env.MAX_FILES_COUNT || '10', 10),
  expiryMinutes: parseInt(process.env.EXPIRY_MINUTES || '10', 10),
  uploadDir:
    process.env.UPLOAD_DIR ||
    path.join(__dirname, '..', '..', 'uploads'),
  nodeEnv: process.env.NODE_ENV || 'development',
};

module.exports = env;
