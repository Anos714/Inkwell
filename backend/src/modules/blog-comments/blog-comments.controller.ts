import { AppError } from "../../utils/AppError";
import { verifyAccessToken } from "../../utils/auth";
import { BlogCommentContext, BlogCommentsQueryContext } from "./blog-comments.type";
import * as BlogCommentService from "./blog-comments.service";
import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

export const createCommentController = async (c: BlogCommentContext) => {
  const payload = c.get("user");

  const blogId = c.req.param("blogId");

  const body = c.req.valid("json");

  if (!payload) {
    throw AppError.Unauthorized("Unauthorized");
  }

  if (!blogId) {
    throw AppError.BadRequest("Blog ID is required");
  }

  const comment = await BlogCommentService.createCommentService(
    payload.id,
    blogId,
    body,
  );

  return c.json({
    success: true,
    message: "Comment created successfully",
    data: comment,
  });
};

// The list is public, but when a valid Bearer token rides along each
// comment also carries likedByMe — one optional-auth read, no extra calls.
const getOptionalViewerId = async (c: Context) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) return undefined;
  try {
    const payload = await verifyAccessToken(header.slice("Bearer ".length));
    return typeof payload.id === "string" ? payload.id : undefined;
  } catch {
    return undefined;
  }
};

export const getCommentsController = async (c: BlogCommentsQueryContext) => {
  const blogId = c.req.param("blogId");

  if (!blogId) {
    throw AppError.BadRequest("Blog ID is required");
  }

  const viewerId = await getOptionalViewerId(c);
  const { sort } = c.req.valid("query");
  const comments = await BlogCommentService.getCommentsService(
    blogId,
    viewerId,
    sort,
  );

  return c.json({
    success: true,
    message: "Comment fetched successfully",
    data: comments,
  });
};

export const toggleCommentLikeController = async (c: Context) => {
  const payload = c.get("user");
  const commentId = c.req.param("commentId");

  if (!payload) {
    throw AppError.Unauthorized("Unauthorized");
  }

  if (!commentId) {
    throw AppError.BadRequest("Comment ID is required");
  }

  const result = await BlogCommentService.toggleCommentLikeService(
    payload.id,
    commentId,
  );

  return c.json(
    {
      success: true,
      liked: result.liked,
      totalLikes: result.totalLikes,
      message: result.liked ? "Comment liked" : "Comment unliked",
    },
    result.statusCode as ContentfulStatusCode,
  );
};

export const getRecentCommentsController = async (c: Context) => {
  const limitRaw = c.req.query("limit");
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined;

  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
    throw AppError.BadRequest("Limit must be a positive integer");
  }

  const comments = await BlogCommentService.getRecentCommentsService(limit);

  return c.json({
    success: true,
    message: "Recent comments fetched successfully",
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
