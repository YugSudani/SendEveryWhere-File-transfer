const mongoose = require('mongoose');
const dns = require('dns');
const logger = require('../utils/logger');

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

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  });
  logger.info('MongoDB connected');
}

module.exports = connectDb;
