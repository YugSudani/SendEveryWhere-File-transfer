// Placeholder for a future S3/R2 implementation.
// Services must only call the storage interface methods, so swapping
// local.storage with this module requires no service changes.

function notImplemented(name) {
  throw new Error(`s3.storage.${name} is not implemented`);
}

async function getFilePath() {
  return notImplemented('getFilePath');
}

async function deleteFile() {
  return notImplemented('deleteFile');
}

async function deleteFiles() {
  return notImplemented('deleteFiles');
}

async function listFiles() {
  return notImplemented('listFiles');
}

async function createZip() {
  return notImplemented('createZip');
}

module.exports = { getFilePath, deleteFile, deleteFiles, listFiles, createZip };
