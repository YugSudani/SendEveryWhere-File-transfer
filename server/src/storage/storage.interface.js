/**
 * Storage interface (documented contract).
 * Any S3-compatible implementation must expose:
 *   presignPut(key, contentType)      -> Promise<putUrl>   (time-limited upload URL)
 *   presignGet(key, downloadName)     -> Promise<getUrl>    (time-limited, attachment disposition)
 *   getObjectStream(key)              -> Promise<Readable>  (object body, for server-side ZIP)
 *   objectExists(key)                 -> Promise<boolean>
 *   deleteFile(key)                   -> Promise<void>   (throws if the object is still there afterwards)
 *   deleteFiles(keys[])               -> Promise<void>
 *   listObjectsPage(continuationToken) -> Promise<{ objects: [{ key, lastModified }], nextToken }>
 *
 * Object keys are random and unguessable; original filenames are NEVER used
 * as keys or object metadata.
 */
module.exports = {};
