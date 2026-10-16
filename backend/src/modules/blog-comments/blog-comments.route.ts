import { Hono } from "hono";
import { requireAuth } from "../../middleware/auth.middleware";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { blogCommentsSchema } from "./blog-comments.schema";
import * as BlogCommentController from "./blog-comments.controller";

const blogCommentsRoute = new Hono();

const commentIdParamSchema = z.object({
  commentId: z.uuid({ error: "Comment ID must be a valid UUID" }),
});

blogCommentsRoute.post(
  "/:blogId/comments",
  requireAuth,
  zValidator("json", blogCommentsSchema, (result, _) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  BlogCommentController.createCommentController,
);

blogCommentsRoute.get(
  "/recent",
  BlogCommentController.getRecentCommentsController,
);

blogCommentsRoute.get(
  "/:blogId/comments",
  BlogCommentController.getCommentsController,
);

blogCommentsRoute.post(
  "/comments/:commentId/like",
  requireAuth,
  zValidator("param", commentIdParamSchema, (result, _) => {
    if (!result.success) throw result.error;
  }),
  BlogCommentController.toggleCommentLikeController,
);

blogCommentsRoute.delete(
  "/comments/:commentId",
  requireAuth,
  BlogCommentController.deleteCommentController,
);

export default blogCommentsRoute;
