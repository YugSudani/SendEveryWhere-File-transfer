const asyncHandler = require('../utils/asyncHandler');
const storage = require('../storage');
const shareService = require('../services/share.service');
const { resolveDownload } = require('../services/download.service');
const { buildZipForShare, removeTempFile } = require('../services/zip.service');

const uploadFiles = asyncHandler(async (req, res) => {
  try {
    const doc = await shareService.createShare(req.files);
    return res.status(201).json({
      success: true,
      data: {
        code: doc.code,
        files: doc.files.map((f) => ({
          name: f.originalName,
          size: f.size,
        })),
        totalSize: doc.totalSize,
        expiresAt: doc.expiresAt,
      },
      message: 'Files uploaded',
    });
  } catch (err) {
    if (req.files) {
      const names = req.files.map((f) => f.filename);
      await storage.deleteFiles(names);
    }
    throw err;
  }
});

const getFileInfo = asyncHandler(async (req, res) => {
  const doc = await shareService.getShareByCode(req.params.code);
  return res.json({
    success: true,
    data: {
      code: doc.code,
      files: doc.files.map((f) => ({
        name: f.originalName,
        size: f.size,
      })),
      totalSize: doc.totalSize,
      expiresAt: doc.expiresAt,
    },
    message: 'Share found',
  });
});

const downloadFiles = asyncHandler(async (req, res) => {
  const resolved = await resolveDownload(req.params.code);
  if (resolved.type === 'single') {
    return res.download(resolved.filePath, resolved.downloadName);
  }
  const zipPath = await buildZipForShare(resolved.doc);
  return res.download(zipPath, `files-${resolved.doc.code}.zip`, async () => {
    await removeTempFile(zipPath);
  });
});

module.exports = { uploadFiles, getFileInfo, downloadFiles };
