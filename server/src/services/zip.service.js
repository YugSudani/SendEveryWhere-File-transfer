const os = require('os');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const constants = require('../config/constants');
const storage = require('../storage');

async function buildZipForShare(doc) {
  const zipName = `${constants.ZIP_PREFIX}${doc.code}-${crypto
    .randomBytes(4)
    .toString('hex')}.zip`;
  const destPath = path.join(os.tmpdir(), zipName);
  const entries = doc.files.map((f) => ({
    filePath: storage.getFilePath(f.storedName),
    name: f.originalName,
  }));
  await storage.createZip(entries, destPath);
  return destPath;
}

async function removeTempFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

module.exports = { buildZipForShare, removeTempFile };
