/**
 *  ApiResponse and ApiResponseError interfaces
 *  These interfaces define the standard structure of API responses and errors.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  details?: unknown;
}

export class ApiResponseError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
