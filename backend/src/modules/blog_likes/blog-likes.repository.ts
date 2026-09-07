import { and, count, eq } from "drizzle-orm";
import { db } from "../../db/db";
import { blogLikes } from "../../db/schema";

export const checkExistingLike = async (blogId: string, userId: string) => {
  const [existingLike] = await db
    .select()
    .from(blogLikes)
    .where(and(eq(blogLikes.blogId, blogId), eq(blogLikes.userId, userId)));
  return existingLike;
};

export const deleteLike = async (blogId: string, userId: string) => {
  await db
    .delete(blogLikes)
    .where(and(eq(blogLikes.blogId, blogId), eq(blogLikes.userId, userId)));
};

export const countLikes = async (blogId: string) => {
  const result = await db
    .select({ total: count() })
    .from(blogLikes)
    .where(eq(blogLikes.blogId, blogId));
  return result[0]?.total ?? 0;
};

export const createLike = async (blogId: string, userId: string) => {
  await db.insert(blogLikes).values({ userId, blogId });
};
