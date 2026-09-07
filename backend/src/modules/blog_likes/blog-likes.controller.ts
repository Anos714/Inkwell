import { Context } from "hono";
import { AppError } from "../../utils/AppError";
import {
  currentUserLikeStatusService,
  toggleBlogLikeService,
} from "./blog-likes.service";
import { ContentfulStatusCode } from "hono/utils/http-status";

export const blogLikeToggleController = async (c: Context) => {
  const payload = c.get("user");
  const blogId = c.req.param("blogId");

  if (!payload) {
    throw AppError.Unauthorized("Unauthorized");
  }

  if (!blogId) {
    throw AppError.BadRequest("Blog ID is required");
  }

  const result = await toggleBlogLikeService(blogId, payload.id);

  return c.json(
    {
      success: true,
      liked: result.liked,
      totalLikes: result.totalLikes,
      message: result.message,
    },
    result.statusCode as ContentfulStatusCode,
  );
};

export const getBlogLikeStatusController = async (c: Context) => {
  const blogId = c.req.param("id");
  const payload = c.get("user");

  if (!payload) {
    throw AppError.Unauthorized("Unauthorized");
  }

  if (!blogId) {
    throw AppError.BadRequest("Blog ID is required");
  }

  const result = await currentUserLikeStatusService(payload.id, blogId);

  return c.json(
    {
      success: true,
      liked: result.liked,
      totalLikes: result.totalLikes,
      message: result.message,
    },
    result.statusCode as ContentfulStatusCode,
  );
};
