import { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError extends Error {
  public statusCode: ContentfulStatusCode;

  constructor(message: string, statusCode: ContentfulStatusCode) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static BadRequest(message: string) {
    return new AppError(message, 400);
  }

  static NotFound(message: string) {
    return new AppError(message, 404);
  }

  static InternalServerError(message: string) {
    return new AppError(message, 500);
  }

  static Unauthorized(message: string) {
    return new AppError(message, 401);
  }

  static Forbidden(message: string) {
    return new AppError(message, 403);
  }

  static Conflict(message: string) {
    return new AppError(message, 409);
  }

  static ValidationError(message: string) {
    return new AppError(message, 422);
  }

  static TooManyRequests(message: string) {
    return new AppError(message, 429);
  }
}
