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

async function listFiles() {
  let entries;
  try {
    entries = await fs.readdir(constants.UPLOAD_DIR, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }

  const files = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const fullPath = path.join(constants.UPLOAD_DIR, entry.name);
    // eslint-disable-next-line no-await-in-loop
    const stat = await fs.stat(fullPath);
    files.push({ name: entry.name, modifiedMs: stat.mtimeMs });
  }
  return files;
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

module.exports = { getFilePath, deleteFile, deleteFiles, listFiles, createZip };
