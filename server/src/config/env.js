require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const isProd = (process.env.NODE_ENV || 'development') === 'production';

const mongoUri = (process.env.MONGO_URI || '').trim();

// In production we must NOT silently fall back to a local MongoDB that doesn't exist.
if (!mongoUri && isProd) {
  throw new Error(
    'MONGO_URI is not set. Configure it in your deployment environment (see server/.env.example).'
  );
}

// Object-key prefix, e.g. "dev/" or "prod/". Keeps local and deployed servers
// from touching each other's files when they share one bucket. Always either
// empty or ending in "/".
function normalizePrefix(raw) {
  const p = (raw === undefined ? (isProd ? 'prod/' : 'dev/') : raw).trim();
  if (!p) return '';
  return p.endsWith('/') ? p : `${p}/`;
}

const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: mongoUri || 'mongodb://localhost:27017/send-everywhere',
  // Optional: overrides the database name in MONGO_URI. Use a different name
  // for local dev vs. production so two servers never share one collection.
  mongoDbName: (process.env.MONGO_DB_NAME || '').trim(),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10),
  maxFilesCount: parseInt(process.env.MAX_FILES_COUNT || '10', 10),
  expiryMinutes: parseInt(process.env.EXPIRY_MINUTES || '10', 10),
  // How long a sender has to finish uploading before an unfinished share is
  // discarded. Must be longer than your slowest realistic upload.
  uploadWindowMinutes: parseInt(process.env.UPLOAD_WINDOW_MINUTES || '60', 10),
  // Filebase (S3-compatible) connection. Files live here, the browser uploads
  // and downloads against presigned URLs; the server never stores file bytes.
  filebase: {
    endpoint: (process.env.FILEBASE_ENDPOINT || '').trim(),
    region: (process.env.FILEBASE_REGION || 'auto').trim(),
    accessKey: (process.env.FILEBASE_KEY || '').trim(),
    secretKey: (process.env.FILEBASE_SECRET || '').trim(),
    bucket: (process.env.FILEBASE_BUCKET || '').trim(),
    keyPrefix: normalizePrefix(process.env.FILEBASE_KEY_PREFIX),
    // After every delete, HEAD the object to prove it is really gone. The DB
    // record is kept (and retried next tick) if the object is still there.
    verifyDelete: (process.env.VERIFY_DELETE || 'true').trim().toLowerCase() !== 'false',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
};

module.exports = env;
