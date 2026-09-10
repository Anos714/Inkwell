import { Context, Env } from "hono";
import { UpdateProfileInput } from "./users.schema";

export interface AuthSuccessResponse {
  success: boolean;
  message?: string;
  user?: unknown;
  token?: string;
}

export type UpdateProfileContext = Context<
  Env,
  string,
  {
    in: { json: UpdateProfileInput };
    out: { json: UpdateProfileInput };
  }
>;
