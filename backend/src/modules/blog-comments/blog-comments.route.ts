import { Hono } from "hono";
import { requireAuth } from "../../middleware/auth.middleware";
import { zValidator } from "@hono/zod-validator";
import { blogCommentsSchema } from "./blog-comments.schema";
import * as BlogCommentController from "./blog-comments.controller";

const blogCommentsRoute = new Hono();

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
  "/:blogId/comments",
  BlogCommentController.getCommentsController,
);

blogCommentsRoute.delete(
  "/comments/:commentId",
  requireAuth,
  BlogCommentController.deleteCommentController,
);

export default blogCommentsRoute;
