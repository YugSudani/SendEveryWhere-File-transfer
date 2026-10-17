/**
 * Storage interface (documented contract).
 * Any implementation must expose:
 *   getFilePath(storedName) -> string
 *   deleteFile(storedName) -> Promise<void>
 *   deleteFiles(storedNames[]) -> Promise<void>
 *   createZip(entries[{ filePath, name }], destPath) -> Promise<void>
 */
module.exports = {};
