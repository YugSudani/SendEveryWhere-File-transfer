function errorHandler(err, req, res, next) {
  void next;
  const status = err && err.statusCode ? err.statusCode : 500;
  const message =
    status === 500 ? 'Internal server error' : err.message || 'Error';
  return res
    .status(status)
    .json({ success: false, data: null, message });
}

module.exports = errorHandler;
