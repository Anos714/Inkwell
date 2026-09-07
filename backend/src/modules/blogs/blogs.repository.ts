import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db/db";
import { blogs, users } from "../../db/schema";
import { AppError } from "../../utils/AppError";
import { CreateBlogInput, PatchBlogInput } from "./blogs.schema";

export const IsAdmin = async (userId: string) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) {
    throw AppError.NotFound("User not found");
  }
  return user.role === "admin";
};

export const createBlog = async (data: CreateBlogInput) => {
  const [blog] = await db.insert(blogs).values(data).returning();
  if (!blog) {
    throw AppError.InternalServerError("Failed to create blog");
  }
  return blog;
};

export const patchBlog = async (blogId: string, data: PatchBlogInput) => {
  const [blog] = await db
    .update(blogs)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(blogs.id, blogId))
    .returning();
  if (!blog) {
    throw AppError.InternalServerError("Failed to patch or update blog");
  }
  return blog;
};

export const deleteBlog = async (blogId: string) => {
  const [blog] = await db.delete(blogs).where(eq(blogs.id, blogId)).returning();
  if (!blog) {
    throw AppError.InternalServerError("Failed to delete blog");
  }
  return blog;
};

export const findBlogById = async (blogId: string) => {
  const [blog] = await db.select().from(blogs).where(eq(blogs.id, blogId));
  if (!blog) {
    throw AppError.NotFound("Blog not found");
  }
  return blog;
};

export const findPublishedBlogs = async (params: {
  page: number;
  limit: number;
  search?: string;
}) => {
  const { page, limit, search } = params;
  const offset = (page - 1) * limit;

  const conditions = [eq(blogs.isPublished, true)];

  if (search && search.trim() !== "") {
    const searchPattern = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(blogs.title, searchPattern),
        ilike(blogs.description, searchPattern),
      )!,
    );
  }

  const whereClause = and(...conditions);

  const [blogList, totalResult] = await Promise.all([
    db
      .select()
      .from(blogs)
      .where(whereClause)
      .orderBy(desc(blogs.publishedAt), desc(blogs.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(blogs).where(whereClause),
  ]);

  const total = totalResult[0]?.total ?? 0;

  return {
    blogs: blogList,
    total,
  };
};
