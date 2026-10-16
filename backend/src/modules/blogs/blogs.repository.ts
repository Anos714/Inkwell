import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../../db/db";
import { blogComments, blogLikes, blogs, users } from "../../db/schema";
import { AppError } from "../../utils/AppError";
import { CreateBlogInput, PatchBlogInput } from "./blogs.schema";
import { countLikes } from "../blog_likes/blog-likes.repository";

export const IsAdmin = async (userId: string) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) {
    throw AppError.NotFound("User not found");
  }
  return user.role === "admin";
};

export const createBlog = async (data: CreateBlogInput) => {
  const [blog] = await db
    .insert(blogs)
    .values({
      ...data,
      publishedAt: data.isPublished ? new Date() : null,
    })
    .returning();
  if (!blog) {
    throw AppError.InternalServerError("Failed to create blog");
  }
  return blog;
};

export const patchBlog = async (blogId: string, data: PatchBlogInput) => {
  // Only manage publishedAt when the publish flag is part of the patch.
  let publishedAt: Date | null | undefined;
  if (data.isPublished !== undefined) {
    if (data.isPublished) {
      const [current] = await db
        .select({ publishedAt: blogs.publishedAt })
        .from(blogs)
        .where(eq(blogs.id, blogId));
      // Keep the original publish date; stamp it on draft → publish.
      publishedAt = current?.publishedAt ?? new Date();
    } else {
      publishedAt = null;
    }
  }

  const [blog] = await db
    .update(blogs)
    .set({
      ...data,
      ...(publishedAt !== undefined ? { publishedAt } : {}),
      updatedAt: new Date(),
    })
    .where(eq(blogs.id, blogId))
    .returning();
  if (!blog) {
    throw AppError.NotFound("Blog not found");
  }
  return blog;
};

export const deleteBlog = async (blogId: string) => {
  const [blog] = await db.delete(blogs).where(eq(blogs.id, blogId)).returning();
  if (!blog) {
    throw AppError.NotFound("Blog not found");
  }
  return blog;
};

export const findBlogById = async (blogId: string) => {
  const [blog] = await db.select().from(blogs).where(eq(blogs.id, blogId));
  if (!blog) {
    throw AppError.NotFound("Blog not found");
  }

  const likesCount = await countLikes(blogId);

  return { ...blog, likesCount };
};

export const findBlogBySlug = async (slug: string) => {
  const [blog] = await db
    .select()
    .from(blogs)
    .where(and(eq(blogs.slug, slug), eq(blogs.isPublished, true)));
  if (!blog) {
    throw AppError.NotFound("Blog not found");
  }

  const likesCount = await countLikes(blog.id);

  return { ...blog, likesCount };
};

export const findAnyBlogBySlug = async (slug: string) => {
  const [blog] = await db.select().from(blogs).where(eq(blogs.slug, slug));
  if (!blog) {
    throw AppError.NotFound("Blog not found");
  }

  const likesCount = await countLikes(blog.id);

  return { ...blog, likesCount };
};

export const incrementBlogViews = async (slug: string) => {
  const [blog] = await db
    .update(blogs)
    .set({ views: sql`${blogs.views} + 1` })
    .where(and(eq(blogs.slug, slug), eq(blogs.isPublished, true)))
    .returning({ views: blogs.views });

  if (!blog) {
    throw AppError.NotFound("Blog not found");
  }

  return blog.views;
};

export const findPublishedBlogs = async (params: {
  page: number;
  limit: number;
  search?: string;
  tag?: string;
  sort?: "latest" | "oldest" | "most_viewed";
}) => {
  const { page, limit, search, tag, sort = "latest" } = params;
  const offset = (page - 1) * limit;

  const conditions = [eq(blogs.isPublished, true)];

  if (tag) {
    // Tags are stored lowercased on write, so an exact array match is enough.
    conditions.push(sql`${blogs.tags} @> array[${tag}]`);
  }

  if (search && search.trim() !== "") {
    // Multi-word search: every term must appear in the title or description.
    // Wildcard chars are stripped so a term can never widen the match.
    const terms = search
      .trim()
      .split(/\s+/)
      .map((term) => term.replace(/[%_\\]/g, "").slice(0, 50))
      .filter(Boolean)
      .slice(0, 5);
    for (const term of terms) {
      const pattern = `%${term}%`;
      conditions.push(
        or(
          ilike(blogs.title, pattern),
          ilike(blogs.description, pattern),
        )!,
      );
    }
  }

  const whereClause = and(...conditions);

  // coalesce keeps NULL publishedAt rows from floating above fresh posts —
  // that NULLS-FIRST default was burying the latest entries.
  const freshestFirst = sql`coalesce(${blogs.publishedAt}, ${blogs.createdAt})`;
  const orderBy =
    sort === "oldest"
      ? [sql`${freshestFirst} asc`, asc(blogs.createdAt)]
      : sort === "most_viewed"
        ? [desc(blogs.views), sql`${freshestFirst} desc`]
        : [sql`${freshestFirst} desc`, desc(blogs.createdAt)];

  const [blogList, totalResult] = await Promise.all([
    db
      .select()
      .from(blogs)
      .where(whereClause)
      .orderBy(...orderBy)
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

export const getBlogTags = async (max = 30) => {
  const rows = await db.execute<{ tag: string; count: number }>(sql`
    select tag, count(*)::int as count from (
      select unnest(tags) as tag from ${blogs} where is_published = true
    ) t group by tag order by count desc limit ${max}
  `);
  return rows.rows ?? rows;
};

export const findAllBlogs = async (params?: { limit?: number; offset?: number }) => {
  const limit = Math.min(Math.max(params?.limit ?? 100, 1), 200);
  const offset = Math.max(params?.offset ?? 0, 0);
  return db
    .select()
    .from(blogs)
    .orderBy(desc(blogs.updatedAt), desc(blogs.createdAt))
    .limit(limit)
    .offset(offset);
};

export const getDashboardSummary = async () => {
  const [totalBlogs, publishedBlogs, draftBlogs, totalLikes, totalComments, views] =
    await Promise.all([
      db.select({ total: count() }).from(blogs),
      db
        .select({ total: count() })
        .from(blogs)
        .where(eq(blogs.isPublished, true)),
      db
        .select({ total: count() })
        .from(blogs)
        .where(eq(blogs.isPublished, false)),
      db.select({ total: count() }).from(blogLikes),
      db.select({ total: count() }).from(blogComments),
      db
        .select({ total: sql<number>`coalesce(sum(${blogs.views}), 0)::int` })
        .from(blogs),
    ]);

  return {
    totalBlogs: totalBlogs[0]?.total ?? 0,
    publishedBlogs: publishedBlogs[0]?.total ?? 0,
    draftBlogs: draftBlogs[0]?.total ?? 0,
    totalLikes: totalLikes[0]?.total ?? 0,
    totalComments: totalComments[0]?.total ?? 0,
    totalViews: views[0]?.total ?? 0,
  };
};
