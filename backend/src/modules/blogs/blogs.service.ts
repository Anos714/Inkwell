import { AppError } from "../../utils/AppError";
import {
  createBlog,
  deleteBlog,
  findBlogById,
  findBlogBySlug,
  findAllBlogs,
  findAnyBlogBySlug,
  findPublishedBlogs,
  getDashboardSummary,
  incrementBlogViews,
  IsAdmin,
  patchBlog,
} from "./blogs.repository";
import {
  CreateBlogInput,
  GetBlogsQueryInput,
  PatchBlogInput,
} from "./blogs.schema";

export const getBlogByIdService = async (blogId: string) => {
  const blog = await findBlogById(blogId);
  return blog;
};

export const getBlogBySlugService = async (slug: string) => {
  const blog = await findBlogBySlug(slug);
  return blog;
};

export const incrementBlogViewsService = async (slug: string) => {
  return incrementBlogViews(slug);
};

export const getAdminBlogsService = async (userId: string) => {
  if (!(await IsAdmin(userId))) {
    throw AppError.Unauthorized("User not authorized");
  }

  return findAllBlogs();
};

export const getAdminBlogBySlugService = async (userId: string, slug: string) => {
  if (!(await IsAdmin(userId))) {
    throw AppError.Unauthorized("User not authorized");
  }

  return findAnyBlogBySlug(slug);
};

export const getDashboardSummaryService = async (userId: string) => {
  if (!(await IsAdmin(userId))) {
    throw AppError.Unauthorized("User not authorized");
  }

  return getDashboardSummary();
};

export const getPublishedBlogsService = async (query: GetBlogsQueryInput) => {
  const { page = 1, limit = 10, search } = query;
  const { blogs, total } = await findPublishedBlogs({ page, limit, search });

  const totalPages = Math.ceil(total / limit);

  return {
    blogs,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const createBlogService = async (
  userId: string,
  data: CreateBlogInput,
) => {
  const user = await IsAdmin(userId);
  if (!user) {
    throw AppError.Unauthorized("User not authorized");
  }

  const blog = await createBlog(data);
  return blog;
};

export const patchBlogService = async (
  userId: string,
  blogId: string,
  data: PatchBlogInput,
) => {
  const user = await IsAdmin(userId);
  if (!user) {
    throw AppError.Unauthorized("User not authorized");
  }

  const blog = await patchBlog(blogId, data);
  return blog;
};

export const deleteBlogService = async (userId: string, blogId: string) => {
  const user = await IsAdmin(userId);
  if (!user) {
    throw AppError.Unauthorized("User not authorized");
  }

  const blog = await deleteBlog(blogId);
  return blog;
};
