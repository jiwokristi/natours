/**
 * Custom operational error used throughout the application
 * for controlled, expected failures (e.g. invalid input, not found).
 */
export class AppError extends Error {
  /** HTTP status code (e.g. 400, 404, 500) */
  public statusCode: number;

  /** "fail" for 4xx errors, "error" for 5xx+ */
  public status: 'fail' | 'error';

  /** Mark whether the error is operational (trusted) */
  public isOperational: boolean;

  /**
   * Create a new AppError instance.
   *
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code
   */
  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Create the stack trace starting from the line where AppError was thrown, not where it was constructed.
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export default AppError;
