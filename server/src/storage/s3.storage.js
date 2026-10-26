const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const env = require('../config/env');
const constants = require('../config/constants');

let s3Client = null;

function getS3() {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: env.filebase.endpoint,
      region: env.filebase.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.filebase.accessKey,
        secretAccessKey: env.filebase.secretKey,
      },
    });
  }
  return s3Client;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Characters that would break a quoted Content-Disposition value.
function dispositionFor(name) {
  return `attachment; filename="${name.replace(/[\r\n"]/g, '')}"`;
}

/**
 * Presigned PUT for the browser's direct upload. The URL embeds the
 * Content-Type, so the browser must send exactly this header (the frontend
 * does). Time-limited to PRESIGN_PUT_TTL seconds.
 */
async function presignPut(key, contentType) {
  const cmd = new PutObjectCommand({
    Bucket: env.filebase.bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getS3(), cmd, { expiresIn: constants.PRESIGN_PUT_TTL });
}

/**
 * Presigned GET for the receiver's direct download. ResponseContentDisposition
 * is baked into the signed URL so the browser saves the file under its
 * original name. Time-limited to PRESIGN_GET_TTL seconds.
 */
async function presignGet(key, downloadName) {
  const cmd = new GetObjectCommand({
    Bucket: env.filebase.bucket,
    Key: key,
    ResponseContentDisposition: dispositionFor(downloadName),
  });
  return getSignedUrl(getS3(), cmd, { expiresIn: constants.PRESIGN_GET_TTL });
}

/**
 * Raw object body stream. Used by the ZIP path, where multiple S3 objects are
 * piped through the server into one archive download.
 */
async function getObjectStream(key) {
  const out = await getS3().send(
    new GetObjectCommand({ Bucket: env.filebase.bucket, Key: key })
  );
  return out.Body;
}

/** true if the object exists, false if the store says 404. Other errors throw. */
async function objectExists(key) {
  try {
    await getS3().send(new HeadObjectCommand({ Bucket: env.filebase.bucket, Key: key }));
    return true;
  } catch (err) {
    const status = err && err.$metadata && err.$metadata.httpStatusCode;
    if (status === 404 || err.name === 'NotFound' || err.name === 'NoSuchKey') return false;
    throw err;
  }
}

/**
 * Deletes one object and (unless VERIFY_DELETE=false) proves it is gone.
 * Throws if the object is still present after several attempts, so callers
 * never remove the DB record of a file that still exists in the bucket.
 */
async function deleteFile(key) {
  const attempts = env.filebase.verifyDelete ? 4 : 1;
  for (let i = 1; i <= attempts; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await getS3().send(new DeleteObjectCommand({ Bucket: env.filebase.bucket, Key: key }));
    if (!env.filebase.verifyDelete) return;
    // eslint-disable-next-line no-await-in-loop
    if (!(await objectExists(key))) return;
    // eslint-disable-next-line no-await-in-loop
    if (i < attempts) await sleep(i * 1000);
  }
  throw new Error(`object still present after ${attempts} delete attempt(s): ${key}`);
}

/** Deletes every key; tries all of them, then throws if any failed. */
async function deleteFiles(keys = []) {
  const results = await Promise.allSettled(keys.map((k) => deleteFile(k)));
  const failed = results
    .map((r, i) => (r.status === 'rejected' ? `${keys[i]}: ${r.reason && r.reason.message}` : null))
    .filter(Boolean);
  if (failed.length) throw new Error(`delete failed for ${failed.length} object(s): ${failed.join(' | ')}`);
}

/** One page of objects under this server's key prefix (dev/ or prod/). */
async function listObjectsPage(continuationToken) {
  const out = await getS3().send(
    new ListObjectsV2Command({
      Bucket: env.filebase.bucket,
      Prefix: env.filebase.keyPrefix || undefined,
      ContinuationToken: continuationToken,
      MaxKeys: 1000,
    })
  );
  const objects = (out.Contents || []).map((o) => ({
    key: o.Key,
    lastModified: o.LastModified,
  }));
  return {
    objects,
    nextToken: out.IsTruncated ? out.NextContinuationToken : null,
  };
}

/** Used only by `npm run diag`. */
async function putTestObject(key, body) {
  await getS3().send(
    new PutObjectCommand({ Bucket: env.filebase.bucket, Key: key, Body: body })
  );
}

module.exports = {
  presignPut,
  presignGet,
  getObjectStream,
  objectExists,
  deleteFile,
  deleteFiles,
  listObjectsPage,
  putTestObject,
};
