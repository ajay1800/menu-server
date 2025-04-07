class ApiError {
  constructor(statusCode, message, errors = []) {
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
  }
}

export { ApiError };
