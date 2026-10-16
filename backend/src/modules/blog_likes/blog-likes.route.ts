import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth.middleware";
import {
  blogLikeToggleController,
  getBlogLikeStatusController,
} from "./blog-likes.controller";

const blogLikesRoute = new Hono();

const blogIdParamSchema = z.object({
  blogId: z.uuid({ error: "Blog ID must be a valid UUID" }),
});

const likeStatusParamSchema = z.object({
  id: z.uuid({ error: "Blog ID must be a valid UUID" }),
});

blogLikesRoute.post(
  "/:blogId/like",
  requireAuth,
  zValidator("param", blogIdParamSchema, (result, _) => {
    if (!result.success) throw result.error;
  }),
  blogLikeToggleController,
);

blogLikesRoute.get(
  "/:id/like-status",
  requireAuth,
  zValidator("param", likeStatusParamSchema, (result, _) => {
    if (!result.success) throw result.error;
  }),
  getBlogLikeStatusController,
);

export default blogLikesRoute;
