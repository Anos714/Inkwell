import { Hono } from "hono";
import { requireAuth } from "../../middleware/auth.middleware";
import {
  blogLikeToggleController,
  getBlogLikeStatusController,
} from "./blog-likes.controller";

const blogLikesRoute = new Hono();

blogLikesRoute.post("/:blogId/like", requireAuth, blogLikeToggleController);

blogLikesRoute.get(
  "/:id/like-status",
  requireAuth,
  getBlogLikeStatusController,
);

export default blogLikesRoute;
