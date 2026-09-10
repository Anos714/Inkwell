import { eq } from "drizzle-orm";
import { db } from "../../db/db";
import { users } from "../../db/schema";
import { AppError } from "../../utils/AppError";
import { TokenPayload } from "google-auth-library";

export const findUserById = async (id: string) => {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
};

export const findUserByEmail = async (email: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
};

export const findUserByGoogleId = async (googleId: string) => {
  const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
  return user;
};

export const findUserByUsername = async (username: string) => {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return user;
};

export const createGoogleAuthUser = async (data: TokenPayload) => {
  if (!data.email || !data.name || !data.sub) {
    throw AppError.BadRequest(
      "Google authentication payload is missing required fields (email, name, or subject).",
    );
  }

  const baseUsername = data.name.trim().slice(0, 90) || `user-${data.sub.slice(-8)}`;
  const usernameTaken = await findUserByUsername(baseUsername);
  const username = usernameTaken
    ? `${baseUsername}-${data.sub.slice(-8)}`
    : baseUsername;

  const [user] = await db
    .insert(users)
    .values({
      googleId: data.sub,
      username,
      avatarUrl: data.picture,
      email: data.email,
    })
    .returning();
  return user;
};

export const updateGoogleAuthUser = async (
  userId: string,
  data: TokenPayload,
) => {
  const [updatedUser] = await db
    .update(users)
    .set({
      googleId: data.sub,
      username: data.name,
    })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser;
};

export const updateUserAvatar = async (userId: string, avatarUrl: string) => {
  const [updatedUser] = await db
    .update(users)
    .set({ avatarUrl })
    .where(eq(users.id, userId))
    .returning();

  return updatedUser;
};
