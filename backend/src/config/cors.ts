import { env } from "./env";

export const corsConfig = {
  origin:
    env.BUN_ENV === "production" ? env.FRONTEND_URL : "http://localhost:5173",
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  maxAge: 86400,
  allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposeHeaders: ["Content-Length"],
};
