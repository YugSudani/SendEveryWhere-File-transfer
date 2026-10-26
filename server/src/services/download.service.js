const { getShareByCode } = require('./share.service');
const storage = require('../storage');

async function resolveDownload(code) {
  const doc = await getShareByCode(code);
  if (doc.files.length === 1) {
    const file = doc.files[0];
    return {
      type: 'single',
      url: await storage.presignGet(file.key, file.originalName),
    };
  }
  return { type: 'zip', doc };
}

module.exports = { resolveDownload };
