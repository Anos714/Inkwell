import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as blogController from "./blogs.controller";
import { createBlogSchema } from "./blogs.schema";
import { requireAuth } from "../../middleware/auth.middleware";

const blogsRoute = new Hono();

blogsRoute.get("/:blogId", blogController.getBlogByIdController);

blogsRoute.get("/", blogController.getBlogsController);

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
  zValidator("json", createBlogSchema, (result, _) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  blogController.patchBlogController,
);

blogsRoute.delete("/:blogId", requireAuth, blogController.deleteBlogController);

export default blogsRoute;
