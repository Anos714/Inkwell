import { z } from "zod";
import { apiRequest } from "../../../lib/api";
import type { BlogsResponse } from "../types";
import type { Blog, BlogComment, BlogInput, CommentsResponse, DashboardSummary, LikeResponse, RecentCommentsResponse } from "../types";

const blogSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  content: z.unknown(),
  coverImage: z.string().nullable(),
  tags: z.array(z.string()),
  isPublished: z.boolean(),
  views: z.number(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  likesCount: z.number().optional(),
});

const blogsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(blogSchema),
  pagination: z
    .object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNextPage: z.boolean(),
      hasPrevPage: z.boolean(),
    })
    .optional(),
});

const blogResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: blogSchema,
});

const likeResponseSchema = z.object({
  success: z.boolean(),
  liked: z.boolean(),
  totalLikes: z.number(),
  message: z.string(),
});

const viewResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({ views: z.number() }),
});

const dashboardSummarySchema = z.object({
  totalBlogs: z.number(),
  publishedBlogs: z.number(),
  draftBlogs: z.number(),
  totalLikes: z.number(),
  totalComments: z.number(),
  totalViews: z.number(),
});

const dashboardResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: dashboardSummarySchema,
});

export type BlogSort = 'latest' | 'oldest' | 'most_viewed'

type FlatComment = Omit<BlogComment, 'replies'>

const flatCommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  gifUrl: z.string().nullable(),
  parentId: z.string().nullable(),
  createdAt: z.string(),
  likesCount: z.number(),
  likedByMe: z.boolean(),
  user: z
    .object({
      id: z.string(),
      username: z.string(),
      avatarUrl: z.string().nullable(),
    })
    .nullable(),
}) satisfies z.ZodType<FlatComment>

const commentSchema = flatCommentSchema.extend({
  replies: z.array(flatCommentSchema),
}) satisfies z.ZodType<BlogComment>

const commentsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(commentSchema),
});

const recentCommentSchema = flatCommentSchema.extend({
  blog: z
    .object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
    })
    .nullable(),
});

const recentCommentsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(recentCommentSchema),
});

const commentMutationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    id: z.string(),
    userId: z.string(),
    blogId: z.string(),
    content: z.string(),
    gifUrl: z.string().nullable().optional(),
    parentId: z.string().nullable().optional(),
    createdAt: z.string(),
  }),
});

const blogTagsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(z.object({ tag: z.string(), count: z.number() })),
});

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function getPublishedBlogs(
  options: { search?: string; page?: number; limit?: number; tag?: string; sort?: BlogSort } = {},
) {
  const params = new URLSearchParams();
  if (options.search) params.set("search", options.search);
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.tag) params.set("tag", options.tag);
  if (options.sort) params.set("sort", options.sort);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiRequest<BlogsResponse>(
    `/api/v1/blogs${query}`,
    blogsResponseSchema,
  );
}

export function getBlogTags() {
  return apiRequest<{ success: boolean; message: string; data: { tag: string; count: number }[] }>(
    "/api/v1/blogs/tags",
    blogTagsResponseSchema,
  );
}

export function getAdminBlogs(token: string) {
  return apiRequest<BlogsResponse>("/api/v1/blogs/admin", blogsResponseSchema, {
    headers: authHeaders(token),
  });
}

export function getAdminBlogBySlug(token: string, slug: string) {
  return apiRequest<{ success: boolean; message: string; data: Blog }>(
    `/api/v1/blogs/admin/${slug}`,
    blogResponseSchema,
    { headers: authHeaders(token) },
  );
}

export function getDashboardSummary(token: string) {
  return apiRequest<{ success: boolean; message: string; data: DashboardSummary }>(
    "/api/v1/blogs/dashboard",
    dashboardResponseSchema,
    { headers: authHeaders(token) },
  );
}

export function getBlogBySlug(slug: string) {
  return apiRequest<{ success: boolean; message: string; data: Blog }>(
    `/api/v1/blogs/${slug}`,
    blogResponseSchema,
  );
}

export function recordBlogView(slug: string) {
  return apiRequest<{ success: boolean; message: string; data: { views: number } }>(
    `/api/v1/blogs/${slug}/views`,
    viewResponseSchema,
    { method: "POST" },
  );
}

export function createBlog(token: string, data: BlogInput) {
  return apiRequest<{ success: boolean; message: string; data: Blog }>(
    "/api/v1/blogs",
    blogResponseSchema,
    { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) },
  );
}

export function updateBlog(
  token: string,
  blogId: string,
  data: Partial<BlogInput>,
) {
  return apiRequest<{ success: boolean; message: string; data: Blog }>(
    `/api/v1/blogs/${blogId}`,
    blogResponseSchema,
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    },
  );
}

export function deleteBlog(token: string, blogId: string) {
  return apiRequest(`/api/v1/blogs/${blogId}`, undefined, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function toggleBlogLike(token: string, blogId: string) {
  return apiRequest<LikeResponse>(
    `/api/v1/blog-likes/${blogId}/like`,
    likeResponseSchema,
    {
      method: "POST",
      headers: authHeaders(token),
    },
  );
}

export function getBlogLikeStatus(token: string, blogId: string) {
  return apiRequest<LikeResponse>(
    `/api/v1/blog-likes/${blogId}/like-status`,
    likeResponseSchema,
    {
      headers: authHeaders(token),
    },
  );
}

export type CommentSort = 'newest' | 'oldest' | 'top'

export function getBlogComments(blogId: string, token?: string, sort?: CommentSort) {
  const params = sort ? `?sort=${sort}` : ''
  return apiRequest<CommentsResponse>(
    `/api/v1/blog-comments/${blogId}/comments${params}`,
    commentsResponseSchema,
    token ? { headers: authHeaders(token) } : undefined,
  );
}

export function getRecentComments(limit = 12) {
  return apiRequest<RecentCommentsResponse>(
    `/api/v1/blog-comments/recent?limit=${limit}`,
    recentCommentsResponseSchema,
  );
}

export type NewCommentInput = {
  content: string
  parentId?: string
  gifUrl?: string
}

export function createBlogComment(
  token: string,
  blogId: string,
  input: NewCommentInput,
) {
  const body: Record<string, string> = { content: input.content }
  if (input.parentId) body.parentId = input.parentId
  if (input.gifUrl) body.gifUrl = input.gifUrl
  return apiRequest<{
    success: boolean;
    message: string;
    data: {
      id: string;
      userId: string;
      blogId: string;
      content: string;
      createdAt: string;
    };
  }>(
    `/api/v1/blog-comments/${blogId}/comments`,
    commentMutationResponseSchema,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    },
  );
}

export function toggleCommentLike(token: string, commentId: string) {
  return apiRequest<LikeResponse>(
    `/api/v1/blog-comments/comments/${commentId}/like`,
    likeResponseSchema,
    { method: "POST", headers: authHeaders(token) },
  );
}

export function deleteBlogComment(token: string, commentId: string) {
  return apiRequest<{
    success: boolean;
    message: string;
    data: {
      id: string;
      userId: string;
      blogId: string;
      content: string;
      createdAt: string;
    };
  }>(
    `/api/v1/blog-comments/comments/${commentId}`,
    commentMutationResponseSchema,
    { method: "DELETE", headers: authHeaders(token) },
  );
}
