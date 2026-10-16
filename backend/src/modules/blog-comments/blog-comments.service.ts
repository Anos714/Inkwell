import { AppError } from "../../utils/AppError";
import { findBlogById } from "../blogs/blogs.repository";
import * as commentRepository from "./blog-comments.repository";
import type { BlogCommentInput } from "./blog-comments.schema";

export const createCommentService = async (
  userId: string,
  blogId: string,
  input: BlogCommentInput,
) => {
  // Fail with 404 (not a raw FK 500) when the target blog is missing.
  await findBlogById(blogId);

  if (input.parentId) {
    const parent = await commentRepository.getCommentById(input.parentId);
    if (!parent || parent.blogId !== blogId) {
      throw AppError.NotFound("Parent comment not found");
    }
    if (parent.parentId) {
      throw AppError.BadRequest("Replies are limited to one level");
    }
  }

  const comment = await commentRepository.createComment(userId, blogId, {
    content: input.content ?? "",
    parentId: input.parentId,
    gifUrl: input.gifUrl,
  });

  if (!comment) {
    throw AppError.InternalServerError("Failed to create comment");
  }

  return comment;
};

type ThreadedComment = Awaited<
  ReturnType<typeof commentRepository.getTopLevelComments>
>[number] & {
  likedByMe: boolean;
  replies: (Awaited<
    ReturnType<typeof commentRepository.getRepliesForParents>
  >[number] & { likedByMe: boolean })[];
};

export const getCommentsService = async (
  blogId: string,
  viewerId?: string,
): Promise<ThreadedComment[]> => {
  const topLevel = await commentRepository.getTopLevelComments(blogId);
  const replies = await commentRepository.getRepliesForParents(
    topLevel.map((comment) => comment.id),
  );

  const liked = viewerId
    ? await commentRepository.getLikedCommentIds(viewerId, [
        ...topLevel.map((comment) => comment.id),
        ...replies.map((reply) => reply.id),
      ])
    : new Set<string>();

  const repliesByParent = new Map<string, typeof replies>();
  for (const reply of replies) {
    if (!reply.parentId) continue;
    const group = repliesByParent.get(reply.parentId) ?? [];
    group.push(reply);
    repliesByParent.set(reply.parentId, group);
  }

  return topLevel.map((comment) => ({
    ...comment,
    likedByMe: liked.has(comment.id),
    replies: (repliesByParent.get(comment.id) ?? []).map((reply) => ({
      ...reply,
      likedByMe: liked.has(reply.id),
    })),
  }));
};

export const toggleCommentLikeService = async (
  userId: string,
  commentId: string,
) => {
  const comment = await commentRepository.getCommentById(commentId);
  if (!comment) throw AppError.NotFound("Comment not found");

  const alreadyLiked = await commentRepository.hasUserLikedComment(
    userId,
    commentId,
  );

  try {
    if (alreadyLiked) {
      await commentRepository.unlikeComment(userId, commentId);
    } else {
      await commentRepository.likeComment(userId, commentId);
    }
  } catch (error) {
    // A concurrent double-like hits the composite PK — report the true state.
    if ((error as { code?: string }).code === "23505" || (error as { cause?: { code?: string } }).cause?.code === "23505") {
      const totalLikes =
        await commentRepository.countCommentLikes(commentId);
      return { liked: true, totalLikes, statusCode: 200 as const };
    }
    throw error;
  }

  const totalLikes = await commentRepository.countCommentLikes(commentId);
  return {
    liked: !alreadyLiked,
    totalLikes,
    statusCode: (!alreadyLiked ? 201 : 200) as 201 | 200,
  };
};

export const getRecentCommentsService = async (limit?: number) => {
  return commentRepository.getRecentComments(limit);
};

export const deleteCommentService = async (
  userId: string,
  role: string,
  commentId: string,
) => {
  const result = await commentRepository.deleteComment(userId, role, commentId);

  if (!result) {
    throw AppError.NotFound("Comment not found or you are not allowed to delete it");
  }

  return result;
};
