import { AppError } from "../../utils/AppError";
import { findBlogById } from "../blogs/blogs.repository";
import * as commentRepository from "./blog-comments.repository";

export const createCommentService = async (
  userId: string,
  blogId: string,
  content: string,
) => {
  // Fail with 404 (not a raw FK 500) when the target blog is missing.
  await findBlogById(blogId);
  const comment = await commentRepository.createComment(
    userId,
    blogId,
    content,
  );

  if (!comment) {
    throw AppError.InternalServerError("Failed to create comment");
  }

  return comment;
};

export const getCommentsService = async (blogId: string) => {
  const comments = await commentRepository.getComments(blogId);
  return comments;
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
