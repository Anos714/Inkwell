import { Context } from "hono";
import { AppError } from "../../utils/AppError";
import {
  createBlogService,
  deleteBlogService,
  getBlogByIdService,
  getPublishedBlogsService,
  patchBlogService,
} from "./blogs.service";
import {
  CreateBlogContext,
  PatchBlogContext,
  SuccessBlogResponse,
} from "./blogs.types";

export const createBlogController = async (c: CreateBlogContext) => {
  const data = c.req.valid("json");
  const payload = c.get("user");
  const blog = await createBlogService(payload.id, data);
  return c.json<SuccessBlogResponse>({
    success: true,
    message: "Blog created successfully",
    data: blog,
  });
};

export const patchBlogController = async (c: PatchBlogContext) => {
  const data = c.req.valid("json");
  const payload = c.get("user");
  const blogId = c.req.param("blogId");

  if (!blogId) {
    throw AppError.BadRequest("Blog id is required");
  }
  const blog = await patchBlogService(payload.id, blogId, data);
  return c.json<SuccessBlogResponse>({
    success: true,
    message: "Blog updated successfully",
    data: blog,
  });
};

export const deleteBlogController = async (c: Context) => {
  const payload = c.get("user");
  const blogId = c.req.param("blogId");

  if (!blogId) {
    throw AppError.BadRequest("Blog id is required");
  }

  await deleteBlogService(payload.id, blogId);

  return c.json<SuccessBlogResponse>({
    success: true,
    message: "Blog deleted successfully",
  });
};

export const getBlogByIdController = async (c: Context) => {
  const blogId = c.req.param("blogId");

  if (!blogId) {
    throw AppError.BadRequest("Blog id is required");
  }

  const blog = await getBlogByIdService(blogId);
  return c.json<SuccessBlogResponse>({
    success: true,
    message: "Blog fetched successfully",
    data: blog,
  });
};

export const getBlogsController = async (c: Context) => {
  const blogs = await getPublishedBlogsService();
  return c.json({
    success: true,
    message: "Published blogs fetched successfully",
    data: blogs,
  });
};
