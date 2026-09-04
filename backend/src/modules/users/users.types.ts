export interface AuthSuccessResponse {
  success: boolean;
  message?: string;
  user?: unknown;
  token?: string;
}
