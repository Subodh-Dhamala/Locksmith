class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Maintains proper stack trace in Node.js
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;