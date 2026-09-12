import { Context } from "hono";
import { AppError } from "../../utils/AppError";
import {
  createBlogService,
  deleteBlogService,
  getAdminBlogBySlugService,
  getAdminBlogsService,
  getBlogBySlugService,
  getDashboardSummaryService,
  getPublishedBlogsService,
  incrementBlogViewsService,
  patchBlogService,
} from "./blogs.service";
import {
  CreateBlogContext,
  GetBlogsContext,
  PaginatedBlogsResponse,
  PatchBlogContext,
  SuccessBlogResponse,
} from "./blogs.types";
import slugify from "slugify";

export const createBlogController = async (c: CreateBlogContext) => {
  const data = c.req.valid("json");
  const payload = c.get("user");

  // formatting slug
  const rawSlug = data.slug.trim();
  const formattedSlug = slugify(rawSlug, {
    lower: true,
    strict: true,
    trim: true,
  });

  const blog = await createBlogService(payload.id, {
    ...data,
    slug: formattedSlug,
  });
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

export const getBlogBySlugController = async (c: Context) => {
  const slug = c.req.param("slug");

  if (!slug) {
    throw AppError.BadRequest("Blog slug is required");
  }

  const blog = await getBlogBySlugService(slug);
  return c.json<SuccessBlogResponse>({
    success: true,
    message: "Blog fetched successfully",
    data: blog,
  });
};

export const incrementBlogViewsController = async (c: Context) => {
  const slug = c.req.param("slug");

  if (!slug) {
    throw AppError.BadRequest("Blog slug is required");
  }

  const views = await incrementBlogViewsService(slug);
  return c.json({
    success: true,
    message: "Blog view recorded successfully",
    data: { views },
  });
};

export const getAdminBlogsController = async (c: Context) => {
  const payload = c.get("user");
  const blogs = await getAdminBlogsService(payload.id);

  return c.json({
    success: true,
    message: "Admin blogs fetched successfully",
    data: blogs,
  });
};

export const getAdminBlogBySlugController = async (c: Context) => {
  const payload = c.get("user");
  const slug = c.req.param("slug");

  if (!slug) {
    throw AppError.BadRequest("Blog slug is required");
  }

  const blog = await getAdminBlogBySlugService(payload.id, slug);
  return c.json<SuccessBlogResponse>({
    success: true,
    message: "Admin blog fetched successfully",
    data: blog,
  });
};

export const getDashboardSummaryController = async (c: Context) => {
  const payload = c.get("user");
  const data = await getDashboardSummaryService(payload.id);

  return c.json({
    success: true,
    message: "Dashboard summary fetched successfully",
    data,
  });
};

export const getBlogsController = async (c: GetBlogsContext) => {
  const query = c.req.valid("query");
  const { blogs, pagination } = await getPublishedBlogsService(query);
  return c.json<PaginatedBlogsResponse>({
    success: true,
    message: "Published blogs fetched successfully",
    data: blogs,
    pagination,
  });
};
