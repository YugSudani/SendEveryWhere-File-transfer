const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDb(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  logger.info('MongoDB connected');
}

module.exports = connectDb;
