import { Context, Env } from "hono";
import { env } from "../../config/env";
import { googleClient } from "../../config/google";
import { AppError } from "../../utils/AppError";
import { GoogleOAuthInput } from "./users.schema";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import * as authUtils from "../../utils/auth";
import { redisClient } from "../../config/redis";
import { AuthSuccessResponse } from "./users.types";
import { getUserByIdService, googleAuthService } from "./users.service";

type GoogleAuthContext = Context<
  Env,
  string,
  {
    in: { json: GoogleOAuthInput };
    out: { json: GoogleOAuthInput };
  }
>;

export const googleAuthController = async (c: GoogleAuthContext) => {
  const { code } = c.req.valid("json");

  if (!code) {
    throw AppError.BadRequest("Code is required");
  }

  const { tokens } = await googleClient.getToken(code);

  if (!tokens || !tokens.id_token) {
    throw AppError.BadRequest("Failed to retrieve ID token from Google");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const rawPayload = ticket.getPayload();

  if (!rawPayload) {
    throw AppError.BadRequest("Google Authentication failed");
  }

  const payload = rawPayload;

  const user = await googleAuthService(payload);

  if (!user) {
    throw AppError.BadRequest("User not found");
  }

  // tokens
  const accessToken = await authUtils.generateAccessToken(user.id, user.role);
  const refreshToken = await authUtils.generateRefreshToken(user.id);

  const hashedRefreshToken = authUtils.hashRefreshToken(refreshToken);

  await redisClient.set(
    `refresh:${user.id}`,
    hashedRefreshToken,
    "EX",
    60 * 60 * 24 * 7,
  );

  setCookie(c, "refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.BUN_ENV === "production",
    sameSite: env.BUN_ENV === "production" ? "none" : "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return c.json<AuthSuccessResponse>(
    {
      success: true,
      message: "User authenticated",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token: accessToken,
    },
    200,
  );
};

export const refreshTokenController = async (c: Context) => {
  const refreshToken = getCookie(c, "refreshToken");

  if (!refreshToken) {
    throw AppError.Unauthorized("No refresh token provided");
  }

  const payload = await authUtils.verifyRefreshToken(refreshToken);
  if (payload.type !== "refresh" || typeof payload.id !== "string") {
    throw AppError.Unauthorized("Invalid refresh token");
  }

  const userId = payload.id;

  const storedHashedRefreshToken = await redisClient.get(`refresh:${userId}`);

  if (!storedHashedRefreshToken) {
    throw AppError.Unauthorized("Invalid refresh token or expired");
  }

  const hashedRefreshToken = authUtils.hashRefreshToken(refreshToken);

  if (storedHashedRefreshToken !== hashedRefreshToken) {
    await redisClient.del(`refresh:${userId}`);
    throw AppError.Unauthorized("Invalid refresh token");
  }

  const user = await getUserByIdService(userId);
  const newAccessToken = await authUtils.generateAccessToken(user.id, user.role);

  return c.json<AuthSuccessResponse>(
    {
      success: true,
      message: "Refresh token verified successfully",
      token: newAccessToken,
    },
    200,
  );
};

export const getMeController = async (c: Context) => {
  const payload = c.get("user");

  const user = await getUserByIdService(payload.id);
  return c.json<AuthSuccessResponse>(
    {
      success: true,
      message: "User authenticated",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl:user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
    200,
  );
};

export const logoutUserController = async (c: Context) => {
  const payload = c.get("user");
  await redisClient.del(`refresh:${payload.id}`);

  deleteCookie(c, "refreshToken", {
    sameSite: env.BUN_ENV === "production" ? "none" : "lax",
    path: "/",
    secure: env.BUN_ENV === "production",
  });
  return c.json<AuthSuccessResponse>(
    { success: true, message: "Logged out successfully" },
    200,
  );
};
