/** An error carrying the HTTP status the client should receive. */
export class HttpError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    if (details !== undefined) this.details = details;
    Error.captureStackTrace?.(this, HttpError);
  }

  static badRequest(message = "Bad Request", details?: unknown): HttpError {
    return new HttpError(400, message, details);
  }

  static notFound(message = "Not Found"): HttpError {
    return new HttpError(404, message);
  }
}
