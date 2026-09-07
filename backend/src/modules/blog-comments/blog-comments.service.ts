import { AppError } from "../../utils/AppError";
import * as commentRepository from "./blog-comments.repository";

export const createCommentService = async (
  userId: string,
  blogId: string,
  content: string,
) => {
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

export const deleteCommentService = async (
  userId: string,
  role: string,
  commentId: string,
) => {
  const result = await commentRepository.deleteComment(userId, role, commentId);

  if (!result) {
    throw AppError.InternalServerError("Failed to delete comment");
  }

  return result;
};
