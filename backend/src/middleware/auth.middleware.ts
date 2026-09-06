import { Context, Next } from "hono";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/auth";

export const requireAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw AppError.Unauthorized(
      "Access token missing or invalid authorization format",
    );
  }
  const token = authHeader.slice(7);

  try {
    const payload = await verifyAccessToken(token);
    if (
      payload.type !== "access" ||
      typeof payload.id !== "string" ||
      typeof payload.role !== "string"
    ) {
      throw AppError.Unauthorized("Invalid token");
    }
    c.set("user", { id: payload.id, role: payload.role });
    await next();
  } catch (error) {
    throw AppError.Unauthorized("Invalid token");
  }
};
