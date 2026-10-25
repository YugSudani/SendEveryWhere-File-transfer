const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const constants = require('../config/constants');
const ApiError = require('../utils/ApiError');
const storage = require('../storage');

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
    // Ceiling for a single file; a file larger than the total limit can never
    // pass the total check anyway, so reusing it here is safe.
    fileSize: constants.MAX_TOTAL_SIZE_BYTES,
    files: constants.MAX_FILES_COUNT,
  },
  fileFilter,
});

// Enforces the TOTAL size cap (per-file checks alone would allow 10 x 1GB).
// Files are already stored by multer, so clean them up before failing.
function totalSizeLimit(req, res, next) {
  const files = req.files || [];
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  if (totalBytes <= constants.MAX_TOTAL_SIZE_BYTES) return next();
  return storage
    .deleteFiles(files.map((f) => f.filename))
    .catch(() => {})
    .then(() => {
      next(
        ApiError.tooLarge(
          `Out of limit: total size must stay under ${constants.MAX_TOTAL_SIZE_GB}GB.`
        )
      );
    });
}

module.exports = { upload, totalSizeLimit };
