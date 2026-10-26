const asyncHandler = require('../utils/asyncHandler');
const constants = require('../config/constants');
const shareService = require('../services/share.service');
const { resolveDownload } = require('../services/download.service');
const { buildZipEntries, zipToStream } = require('../services/zip.service');
const { sanitizeFilename } = require('../utils/sanitize');

function shareToData(doc) {
  return {
    code: doc.code,
    status: doc.status,
    files: doc.files.map((f) => ({ name: f.originalName, size: f.size })),
    totalSize: doc.totalSize,
    expiresAt: doc.expiresAt,
  };
}

/**
 * POST /api/files/initiate
 * Validates descriptors, stores metadata + random object keys, and returns a
 * 6-digit code plus one presigned PUT URL per file. No file bytes here.
 */
const initiateUpload = asyncHandler(async (req, res) => {
  const specs = req.body.files.map((f) => ({
    filename: sanitizeFilename(f.filename),
    size: Number(f.size),
    type: f.type || 'application/octet-stream',
  }));
  const { code, uploads, doc } = await shareService.initiateShare(specs);
  return res.status(201).json({
    success: true,
    data: { code, uploads, expiresAt: doc.expiresAt },
    message: 'Upload links created',
  });
});

/**
 * POST /api/files/:code/complete
 * Called by the sender once every presigned PUT succeeded. Flips the share
 * to 'ready' and restarts the expiry countdown.
 */
const completeUpload = asyncHandler(async (req, res) => {
  const doc = await shareService.completeShare(req.params.code);
  return res.json({
    success: true,
    data: shareToData(doc),
    message: 'Share is ready',
  });
});

const getFileInfo = asyncHandler(async (req, res) => {
  const doc = await shareService.getShareByCode(req.params.code);
  return res.json({
    success: true,
    data: shareToData(doc),
    message: 'Share found',
  });
});

/**
 * GET /api/files/:code/download
 * Single file -> 302 redirect to the 60s presigned GET URL (also keeps the
 * QR flow working). Multiple files -> stream a ZIP pulled from storage.
 */
const downloadFiles = asyncHandler(async (req, res) => {
  const resolved = await resolveDownload(req.params.code);
  if (resolved.type === 'single') {
    return res.redirect(302, resolved.url);
  }
  const entries = await buildZipEntries(resolved.doc);
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${constants.ZIP_PREFIX}${resolved.doc.code}.zip"`
  );
  await zipToStream(entries, res);
  return null;
});

module.exports = { initiateUpload, completeUpload, getFileInfo, downloadFiles };
