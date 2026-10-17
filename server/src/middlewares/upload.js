const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const constants = require('../config/constants');
const ApiError = require('../utils/ApiError');

if (!fs.existsSync(constants.UPLOAD_DIR)) {
  fs.mkdirSync(constants.UPLOAD_DIR, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, constants.UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').slice(0, 10);
    const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, '');
    cb(null, crypto.randomBytes(16).toString('hex') + safeExt);
  },
});

function fileFilter(req, file, cb) {
  if (!file.originalname || file.originalname.length > 255) {
    return cb(ApiError.badRequest('Invalid file name'));
  }
  return cb(null, true);
}

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: constants.MAX_FILE_SIZE_BYTES,
    files: constants.MAX_FILES_COUNT,
  },
  fileFilter,
});

module.exports = upload;
