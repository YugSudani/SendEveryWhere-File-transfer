const crypto = require('crypto');
const env = require('../config/env');
const constants = require('../config/constants');
const FileShare = require('../models/FileShare');
const storage = require('../storage');
const ApiError = require('../utils/ApiError');
const { generateUniqueCode } = require('./code.service');

function expiryFromNow(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

// Random, unguessable object key: even if someone guesses the 6-digit code,
// they cannot construct the object key without it being returned by our API.
// The prefix (dev/ or prod/) only separates environments sharing one bucket.
function newObjectKey() {
  return `${env.filebase.keyPrefix}${crypto.randomBytes(24).toString('hex')}`;
}

/**
 * Creates the share (metadata only) and presigns one PUT URL per file.
 * The actual file bytes flow browser -> Filebase, never through this server.
 * The share stays 'pending' until the browser confirms completion. Pending
 * shares get the long UPLOAD_WINDOW so cron cannot expire a share while its
 * upload is still running; abandoned ones are still cleaned up afterwards.
 */
async function initiateShare(specs) {
  if (!Array.isArray(specs) || specs.length === 0) {
    throw ApiError.badRequest('No files provided');
  }
  const code = await generateUniqueCode();
  const files = specs.map((s) => ({
    key: newObjectKey(),
    originalName: s.filename,
    size: s.size,
    mimetype: s.type,
  }));
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const doc = await FileShare.create({
    code,
    files,
    totalSize,
    status: 'pending',
    expiresAt: expiryFromNow(constants.UPLOAD_WINDOW_MINUTES),
  });

  const uploads = [];
  for (const f of files) {
    // eslint-disable-next-line no-await-in-loop
    const putUrl = await storage.presignPut(f.key, f.mimetype);
    uploads.push({ id: f.key, filename: f.originalName, putUrl });
  }

  return { code: doc.code, uploads, doc };
}

/**
 * Confirms every file finished uploading. Flips the share to 'ready' and
 * restarts the countdown from this moment (EXPIRY_MINUTES).
 *
 * Atomic: it only matches a share that has NOT expired yet. Once a share is
 * past expiresAt the cleanup cron may already be deleting its objects, so it
 * must never be revived.
 */
async function completeShare(code) {
  const doc = await FileShare.findOneAndUpdate(
    { code, expiresAt: { $gt: new Date() } },
    { $set: { status: 'ready', expiresAt: expiryFromNow(constants.EXPIRY_MINUTES) } },
    { new: true }
  );
  if (!doc) throw ApiError.gone('Upload took too long or the code expired, please retry');
  return doc;
}

async function getShareByCode(code) {
  const doc = await FileShare.findOne({ code });
  if (!doc) throw ApiError.notFound('Invalid or expired code');
  if (doc.expiresAt.getTime() <= Date.now()) {
    throw ApiError.gone('Code has expired');
  }
  if (doc.status !== 'ready') {
    throw new ApiError(409, 'Upload still in progress');
  }
  return doc;
}

async function deleteShareFiles(doc) {
  await storage.deleteFiles(doc.files.map((f) => f.key));
}

/**
 * For every expired share: delete its bucket objects (verified), and ONLY
 * THEN delete the DB record. If anything fails the record stays, so the next
 * tick retries. Nothing else in the app deletes shares.
 */
async function removeExpiredShares() {
  const expired = await FileShare.find({ expiresAt: { $lte: new Date() } });
  let removed = 0;
  for (const doc of expired) {
    const keys = doc.files.map((f) => f.key);
    try {
      // eslint-disable-next-line no-await-in-loop
      await deleteShareFiles(doc);
      // eslint-disable-next-line no-await-in-loop
      await doc.deleteOne();
      removed += 1;
      console.log(
        `[cron] share ${doc.code}: deleted ${keys.length} object(s) from bucket, then its DB record`
      );
    } catch (err) {
      console.error(
        `[cron] share ${doc.code} NOT removed (DB record kept, will retry): ${err.message}` +
          (err && err.$metadata ? ` | http status: ${err.$metadata.httpStatusCode}` : '')
      );
    }
  }
  return { found: expired.length, removed };
}

module.exports = {
  initiateShare,
  completeShare,
  getShareByCode,
  deleteShareFiles,
  removeExpiredShares,
};
