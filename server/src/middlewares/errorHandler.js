const constants = require('../config/constants');

function errorHandler(err, req, res, next) {
  void next;
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      data: null,
      message: `File too large (total limit is ${constants.MAX_TOTAL_SIZE_GB}GB)`,
    });
  }
  if (err && err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      data: null,
      message: `Too many files (max ${constants.MAX_FILES_COUNT})`,
    });
  }
  const status = err && err.statusCode ? err.statusCode : 500;
  const message =
    status === 500 ? 'Internal server error' : err.message || 'Error';
  return res.status(status).json({ success: false, data: null, message });
}

module.exports = errorHandler;
