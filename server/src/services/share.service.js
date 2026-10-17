const constants = require('../config/constants');
const FileShare = require('../models/FileShare');
const storage = require('../storage');
const ApiError = require('../utils/ApiError');
const { sanitizeFilename } = require('../utils/sanitize');
const { generateUniqueCode } = require('./code.service');

function expiryDate() {
  return new Date(Date.now() + constants.EXPIRY_MINUTES * 60 * 1000);
}

async function createShare(multerFiles) {
  if (!multerFiles || multerFiles.length === 0) {
    throw ApiError.badRequest('No files uploaded');
  }
  const code = await generateUniqueCode();
  const files = multerFiles.map((f) => ({
    originalName: sanitizeFilename(f.originalname),
    storedName: f.filename,
    size: f.size,
    mimetype: f.mimetype,
  }));
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const doc = await FileShare.create({
    code,
    files,
    totalSize,
    expiresAt: expiryDate(),
  });
  return doc;
}

async function getShareByCode(code) {
  const doc = await FileShare.findOne({ code });
  if (!doc) throw ApiError.notFound('Invalid or expired code');
  if (doc.expiresAt.getTime() <= Date.now()) {
    throw ApiError.gone('Code has expired');
  }
  return doc;
}

async function deleteShareFiles(doc) {
  const names = doc.files.map((f) => f.storedName);
  await storage.deleteFiles(names);
}

async function removeExpiredShares() {
  const expired = await FileShare.find({
    expiresAt: { $lte: new Date() },
  });
  let removed = 0;
  for (const doc of expired) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await deleteShareFiles(doc);
      // eslint-disable-next-line no-await-in-loop
      await doc.deleteOne();
      removed += 1;
    } catch {
      // keep going; next cron tick retries
    }
  }
  return removed;
}

module.exports = { createShare, getShareByCode, deleteShareFiles, removeExpiredShares };
