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

export const createGoogleAuthUser = async (data: TokenPayload) => {
  if (!data.email || !data.name) {
    throw AppError.BadRequest(
      "Google authentication payload is missing required fields (email or name).",
    );
  }

  const [user] = await db
    .insert(users)
    .values({
      googleId: data.sub,
      username: data.name,
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
      avatarUrl: data.picture,
    })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser;
};
