import { AppError } from "../../utils/AppError";
import {
  createBlog,
  deleteBlog,
  findBlogById,
  findPublishedBlogs,
  IsAdmin,
  patchBlog,
} from "./blogs.repository";
import { CreateBlogInput, PatchBlogInput } from "./blogs.schema";

export const getBlogByIdService = async (blogId: string) => {
  const blog = await findBlogById(blogId);
  return blog;
};

export const getPublishedBlogsService = async () => {
  return findPublishedBlogs();
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
