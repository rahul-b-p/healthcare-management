import { HttpStatus } from "../enums/http.enum";

/**
 * Custom Error class to throw HTTP Status Errors
 */
export class HttpStatusError extends Error {
  status: HttpStatus;

  constructor(status: HttpStatus, message: string, error?: unknown) {
    super(message);
    this.status = status;
    this.name = "HttpStatusError";

    if (error instanceof Error && error.stack) {
      this.stack = error.stack;
    }

    Object.setPrototypeOf(this, HttpStatusError.prototype);
  }
}
