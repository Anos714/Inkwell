import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as blogController from "./blogs.controller";
import {
  createBlogSchema,
  getBlogsQuerySchema,
  patchBlogSchema,
} from "./blogs.schema";
import { requireAuth } from "../../middleware/auth.middleware";

const blogsRoute = new Hono();

blogsRoute.get(
  "/",
  zValidator("query", getBlogsQuerySchema, (result, _) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  blogController.getBlogsController,
);
blogsRoute.get("/dashboard", requireAuth, blogController.getDashboardSummaryController);
blogsRoute.get("/admin", requireAuth, blogController.getAdminBlogsController);
blogsRoute.get(
  "/admin/:slug",
  requireAuth,
  blogController.getAdminBlogBySlugController,
);
blogsRoute.post("/:slug/views", blogController.incrementBlogViewsController);
blogsRoute.get("/:slug", blogController.getBlogBySlugController);

blogsRoute.post(
  "/",
  requireAuth,
  zValidator("json", createBlogSchema, (result, _) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  blogController.createBlogController,
);

blogsRoute.patch(
  "/:blogId",
  requireAuth,
  zValidator("json", patchBlogSchema, (result, _) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  blogController.patchBlogController,
);

blogsRoute.delete("/:blogId", requireAuth, blogController.deleteBlogController);

export default blogsRoute;
