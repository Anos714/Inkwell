import { and, eq } from "drizzle-orm";
import { db } from "../../db/db";
import { blogComments, users } from "../../db/schema";

export const createComment = async (
  userId: string,
  blogId: string,
  content: string,
) => {
  const [comment] = await db
    .insert(blogComments)
    .values({
      userId,
      blogId,
      content,
    })
    .returning();

  return comment;
};

export const getComments = async (blogId: string) => {
  const comments = await db
    .select({
      id: blogComments.id,
      content: blogComments.content,
      createdAt: blogComments.createdAt,
      user: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(blogComments)
    .leftJoin(users, eq(blogComments.userId, users.id))
    .where(eq(blogComments.blogId, blogId));

  return comments;
};

export const deleteComment = async (
  userId: string,
  role: string,
  commentId: string,
) => {
  const [result] = await db
    .delete(blogComments)
    .where(
      role === "admin"
        ? eq(blogComments.id, commentId)
        : and(eq(blogComments.id, commentId), eq(blogComments.userId, userId)),
    )
    .returning();

  return result;
};
