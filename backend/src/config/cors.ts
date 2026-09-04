import { env } from "./env";

export const corsConfig = {
  origin:
    env.BUN_ENV === "production" ? env.FRONTEND_URL : "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  maxAge: 86400,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Length", "X-Kumu-Response-Time"],
};
