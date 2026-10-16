import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "../../db/db";
import { blogComments, blogs, commentLikes, users } from "../../db/schema";

export type CreateCommentInput = {
  content: string;
  parentId?: string;
  gifUrl?: string;
};

export const createComment = async (
  userId: string,
  blogId: string,
  input: CreateCommentInput,
) => {
  const [comment] = await db
    .insert(blogComments)
    .values({
      userId,
      blogId,
      content: input.content,
      parentId: input.parentId ?? null,
      gifUrl: input.gifUrl ?? null,
    })
    .returning();

  return comment;
};

export const getCommentById = async (commentId: string) => {
  const [comment] = await db
    .select()
    .from(blogComments)
    .where(eq(blogComments.id, commentId));
  return comment;
};

// Likes count as an inline sub-select so the thread loads in 2 queries
// (top-level + replies) instead of N+1 per comment.
const likesCountColumn = sql<number>`(
  select count(*)::int from ${commentLikes}
  where ${commentLikes.commentId} = ${blogComments.id}
)`.as("likesCount");

const commentAuthorShape = {
  id: blogComments.id,
  content: blogComments.content,
  gifUrl: blogComments.gifUrl,
  parentId: blogComments.parentId,
  createdAt: blogComments.createdAt,
  likesCount: likesCountColumn,
  user: {
    id: users.id,
    username: users.username,
    avatarUrl: users.avatarUrl,
  },
};

export const getTopLevelComments = async (
  blogId: string,
  params?: { limit?: number; offset?: number },
) => {
  const limit = Math.min(Math.max(params?.limit ?? 50, 1), 100);
  const offset = Math.max(params?.offset ?? 0, 0);
  return db
    .select(commentAuthorShape)
    .from(blogComments)
    .leftJoin(users, eq(blogComments.userId, users.id))
    .where(and(eq(blogComments.blogId, blogId), isNull(blogComments.parentId)))
    .orderBy(desc(blogComments.createdAt))
    .limit(limit)
    .offset(offset);
};

export const getRepliesForParents = async (parentIds: string[]) => {
  if (parentIds.length === 0) return [];
  return db
    .select(commentAuthorShape)
    .from(blogComments)
    .leftJoin(users, eq(blogComments.userId, users.id))
    .where(inArray(blogComments.parentId, parentIds))
    .orderBy(asc(blogComments.createdAt));
};

export const getLikedCommentIds = async (
  userId: string,
  commentIds: string[],
) => {
  if (commentIds.length === 0) return new Set<string>();
  const rows = await db
    .select({ commentId: commentLikes.commentId })
    .from(commentLikes)
    .where(
      and(
        eq(commentLikes.userId, userId),
        inArray(commentLikes.commentId, commentIds),
      ),
    );
  return new Set(rows.map((row) => row.commentId));
};

export const countCommentLikes = async (commentId: string) => {
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(commentLikes)
    .where(eq(commentLikes.commentId, commentId));
  return row?.total ?? 0;
};

export const hasUserLikedComment = async (userId: string, commentId: string) => {
  const [row] = await db
    .select({ commentId: commentLikes.commentId })
    .from(commentLikes)
    .where(
      and(
        eq(commentLikes.userId, userId),
        eq(commentLikes.commentId, commentId),
      ),
    );
  return Boolean(row);
};

export const likeComment = async (userId: string, commentId: string) => {
  await db.insert(commentLikes).values({ userId, commentId });
};

export const unlikeComment = async (userId: string, commentId: string) => {
  await db
    .delete(commentLikes)
    .where(
      and(
        eq(commentLikes.userId, userId),
        eq(commentLikes.commentId, commentId),
      ),
    );
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

export const getRecentComments = async (limit = 12) => {
  return db
    .select({
      id: blogComments.id,
      content: blogComments.content,
      createdAt: blogComments.createdAt,
      user: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
      blog: {
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
      },
    })
    .from(blogComments)
    .leftJoin(users, eq(blogComments.userId, users.id))
    .leftJoin(blogs, eq(blogComments.blogId, blogs.id))
    .where(eq(blogs.isPublished, true))
    .orderBy(desc(blogComments.createdAt))
    .limit(limit);
};
