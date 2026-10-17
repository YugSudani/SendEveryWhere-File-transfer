class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }

  static badRequest(msg = 'Bad request') {
    return new ApiError(400, msg);
  }
  static notFound(msg = 'Not found') {
    return new ApiError(404, msg);
  }
  static gone(msg = 'Expired') {
    return new ApiError(410, msg);
  }
  static tooLarge(msg = 'Payload too large') {
    return new ApiError(413, msg);
  }
}

module.exports = ApiError;
