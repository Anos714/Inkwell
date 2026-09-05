import { env } from "../config/env";
import { sign, verify } from "hono/jwt";
import crypto from "crypto";

export const generateAccessToken = async (userId: string, userRole: string) => {
  const payload = {
    id: userId,
    role: userRole,
    type: "access",
    exp: Math.floor(Date.now() / 1000) + 60 * 15, //15 min.
  };
  return await sign(payload, env.ACCESS_TOKEN_SECRET_KEY, "HS256");
};

export const generateRefreshToken = async (userId: string) => {
  const payload = {
    id: userId,
    type: "refresh",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, //7 days.
  };
  return await sign(payload, env.REFRESH_TOKEN_SECRET_KEY, "HS256");
};

export const hashRefreshToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const verifyRefreshToken = async (token: string) => {
  const payload = await verify(token, env.REFRESH_TOKEN_SECRET_KEY, "HS256");
  return payload;
};

export const verifyAccessToken = async (token: string) => {
  const payload = await verify(token, env.ACCESS_TOKEN_SECRET_KEY, "HS256");
  return payload;
};
