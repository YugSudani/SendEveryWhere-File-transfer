/**
 * Storage interface (documented contract).
 * Any implementation must expose:
 *   getFilePath(storedName) -> string
 *   deleteFile(storedName) -> Promise<void>
 *   deleteFiles(storedNames[]) -> Promise<void>
 *   listFiles() -> Promise<Array<{ name, modifiedMs }>>
 *   createZip(entries[{ filePath, name }], destPath) -> Promise<void>
 */
module.exports = {};
