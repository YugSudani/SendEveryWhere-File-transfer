const path = require('path');

function sanitizeFilename(name) {
  const base = path.basename(String(name || 'file'));
  return base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 255) || 'file';
}

module.exports = { sanitizeFilename };
