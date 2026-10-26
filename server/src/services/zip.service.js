const archiver = require('archiver');
const storage = require('../storage');

/**
 * Opens a stream per stored object and pairs it with the original filename.
 */
async function buildZipEntries(doc) {
  const entries = [];
  for (const f of doc.files) {
    // eslint-disable-next-line no-await-in-loop
    entries.push({
      name: f.originalName,
      stream: await storage.getObjectStream(f.key),
    });
  }
  return entries;
}

/**
 * Multi-file shares stream their ZIP straight to the response: S3 objects are
 * pulled in and piped through archiver, no temp files are ever written.
 */
function zipToStream(entries, writable) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.on('error', reject);
    archive.on('warning', (err) => {
      if (err.code !== 'ENOENT') reject(err);
    });
    writable.on('error', reject);
    writable.on('finish', resolve);
    archive.pipe(writable);
    for (const entry of entries) {
      archive.append(entry.stream, { name: entry.name });
    }
    archive.finalize();
  });
}

module.exports = { buildZipEntries, zipToStream };
