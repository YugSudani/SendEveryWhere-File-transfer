const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');
const logger = require('../utils/logger');
const FileShare = require('../models/FileShare');

async function resolveSrvIfNeeded(uri) {
  if (!uri.startsWith('mongodb+srv://')) return;
  const host = uri.split('@').pop().split('/')[0].split('?')[0];
  const srvName = `_mongodb._tcp.${host}`;
  try {
    await new Promise((resolve, reject) => {
      dns.resolveSrv(srvName, (err, records) => (err ? reject(err) : resolve(records)));
    });
  } catch (err) {
    // Some environments (containers / restricted DNS) refuse SRV queries.
    // Fall back to public resolvers so Atlas +srv URIs still resolve.
    logger.warn('SRV lookup failed, switching to public DNS resolvers', err.code || err.message);
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
}

async function connectDb(uri) {
  if (!uri) throw new Error('MongoDB URI is empty');
  await resolveSrvIfNeeded(uri);

  // Redact credentials when logging.
  const safe = uri.replace(/\/\/[^@]+@/, '//***:***@');
  logger.info('Connecting to MongoDB:', safe);

  const options = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  };
  if (env.mongoDbName) options.dbName = env.mongoDbName;

  await mongoose.connect(uri, options);
  logger.info(`MongoDB connected (database: "${mongoose.connection.name}")`);

  await ensureIndexes();
}

/**
 * 1. Drops EVERY TTL index on the collection (older versions created TTL
 *    indexes on `expiresAt` / `purgeAt`; any of them silently deletes DB
 *    records while leaving the bucket objects behind).
 * 2. Creates the plain indexes the app needs.
 * Idempotent: safe on every boot.
 */
async function ensureIndexes() {
  try {
    await FileShare.createCollection().catch(() => {}); // already exists -> fine
    const coll = FileShare.collection;

    const existing = await coll.indexes();
    for (const idx of existing) {
      if (idx.expireAfterSeconds !== undefined) {
        // eslint-disable-next-line no-await-in-loop
        await coll.dropIndex(idx.name);
        logger.warn(
          `Dropped TTL index "${idx.name}" (key ${JSON.stringify(idx.key)}): ` +
            'it deleted DB records without deleting bucket objects.'
        );
      }
    }

    await coll.createIndex({ code: 1 }, { unique: true });
    await coll.createIndex({ expiresAt: 1 });

    const final = await coll.indexes();
    logger.info(
      'Indexes on fileshares:',
      final.map((i) => `${i.name}${i.expireAfterSeconds !== undefined ? ' [TTL!]' : ''}`).join(', ')
    );
  } catch (err) {
    // Never crash the server over index maintenance; log it loudly instead.
    logger.error('Index setup failed:', err.message);
  }
}

module.exports = connectDb;
