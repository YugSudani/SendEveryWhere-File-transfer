const fs = require('fs/promises');
const path = require('path');
const archiver = require('archiver');
const { createWriteStream } = require('fs');
const constants = require('../config/constants');

function getFilePath(storedName) {
  return path.join(constants.UPLOAD_DIR, path.basename(storedName));
}

async function deleteFile(storedName) {
  try {
    await fs.unlink(getFilePath(storedName));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

async function deleteFiles(storedNames = []) {
  await Promise.all(storedNames.map((n) => deleteFile(n)));
}

function createZip(entries, destPath) {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(destPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    output.on('error', reject);
    archive.on('error', reject);
    archive.pipe(output);
    for (const entry of entries) {
      archive.file(entry.filePath, { name: entry.name });
    }
    archive.finalize();
  });
}

module.exports = { getFilePath, deleteFile, deleteFiles, createZip };
