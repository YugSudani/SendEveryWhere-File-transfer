const crypto = require('crypto');
const constants = require('../config/constants');
const FileShare = require('../models/FileShare');

function randomCode() {
  const range = constants.CODE_MAX - constants.CODE_MIN + 1;
  const n = crypto.randomInt(constants.CODE_MIN, constants.CODE_MAX + 1);
  void range;
  return String(n);
}

async function generateUniqueCode() {
  for (let i = 0; i < constants.CODE_MAX_RETRIES; i += 1) {
    const code = randomCode();
    const exists = await FileShare.exists({ code });
    if (!exists) return code;
  }
  throw new Error('Failed to generate unique code');
}

module.exports = { generateUniqueCode };
