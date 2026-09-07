import { AppError } from "../../utils/AppError";
import { BlogCommentContext } from "./blog-comments.type";
import * as BlogCommentService from "./blog-comments.service";
import { Context } from "hono";

export const createCommentController = async (c: BlogCommentContext) => {
  const payload = c.get("user");

  const blogId = c.req.param("blogId");

  const { content } = c.req.valid("json");

  if (!payload) {
    throw AppError.Unauthorized("Unauthorized");
  }

  if (!blogId) {
    throw AppError.BadRequest("Blog ID is required");
  }

  const comment = await BlogCommentService.createCommentService(
    payload.id,
    blogId,
    content,
  );

  return c.json({
    success: true,
    message: "Comment created successfully",
    data: comment,
  });
};

export const getCommentsController = async (c: Context) => {
  const blogId = c.req.param("blogId");

  if (!blogId) {
    throw AppError.BadRequest("Blog ID is required");
  }

  const comments = await BlogCommentService.getCommentsService(blogId);

  return c.json({
    success: true,
    message: "Comment fetched successfully",
    data: comments,
  });
};

export const deleteCommentController = async (c: Context) => {
  const payload = c.get("user");
  const commentId = c.req.param("commentId");

  if (!payload) {
    throw AppError.Unauthorized("Unauthorized");
  }

  if (!commentId) {
    throw AppError.BadRequest("Comment ID is required");
  }

  const result = await BlogCommentService.deleteCommentService(
    payload.id,
    payload.role,
    commentId,
  );

  return c.json({
    success: true,
    message: "Comment deleted successfully",
    data: result,
  });
};
