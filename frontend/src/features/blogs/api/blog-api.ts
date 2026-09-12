import { z } from 'zod'
import { apiRequest } from '../../../lib/api'
import type { BlogsResponse } from '../types'
import type { Blog, BlogInput, CommentsResponse, LikeResponse } from '../types'

const blogSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  content: z.unknown(),
  coverImage: z.string().nullable(),
  tags: z.array(z.string()),
  isPublished: z.boolean(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  likesCount: z.number().optional(),
})

const blogsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(blogSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
  }).optional(),
})

const blogResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: blogSchema,
})

const likeResponseSchema = z.object({
  success: z.boolean(),
  liked: z.boolean(),
  totalLikes: z.number(),
  message: z.string(),
})

const commentSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    avatarUrl: z.string().nullable(),
  }).nullable(),
})

const commentsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(commentSchema),
})

const commentMutationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    id: z.string(),
    userId: z.string(),
    blogId: z.string(),
    content: z.string(),
    createdAt: z.string(),
  }),
})

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export function getPublishedBlogs(options: { search?: string; page?: number; limit?: number } = {}) {
  const params = new URLSearchParams()
  if (options.search) params.set('search', options.search)
  if (options.page) params.set('page', String(options.page))
  if (options.limit) params.set('limit', String(options.limit))
  const query = params.toString() ? `?${params.toString()}` : ''
  return apiRequest<BlogsResponse>(`/api/v1/blogs${query}`, blogsResponseSchema)
}

export function getBlogBySlug(slug: string) {
  return apiRequest<{ success: boolean; message: string; data: Blog }>(
    `/api/v1/blogs/${slug}`,
    blogResponseSchema,
  )
}

export function createBlog(token: string, data: BlogInput) {
  return apiRequest<{ success: boolean; message: string; data: Blog }>(
    '/api/v1/blogs',
    blogResponseSchema,
    { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) },
  )
}

export function updateBlog(token: string, blogId: string, data: Partial<BlogInput>) {
  return apiRequest<{ success: boolean; message: string; data: Blog }>(
    `/api/v1/blogs/${blogId}`,
    blogResponseSchema,
    { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(data) },
  )
}

export function deleteBlog(token: string, blogId: string) {
  return apiRequest(`/api/v1/blogs/${blogId}`, undefined, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export function toggleBlogLike(token: string, blogId: string) {
  return apiRequest<LikeResponse>(`/api/v1/blog-likes/${blogId}/like`, likeResponseSchema, {
    method: 'POST',
    headers: authHeaders(token),
  })
}

export function getBlogLikeStatus(token: string, blogId: string) {
  return apiRequest<LikeResponse>(`/api/v1/blog-likes/${blogId}/like-status`, likeResponseSchema, {
    headers: authHeaders(token),
  })
}

export function getBlogComments(blogId: string) {
  return apiRequest<CommentsResponse>(`/api/v1/blog-comments/${blogId}/comments`, commentsResponseSchema)
}

export function createBlogComment(token: string, blogId: string, content: string) {
  return apiRequest<{
    success: boolean
    message: string
    data: { id: string; userId: string; blogId: string; content: string; createdAt: string }
  }>(
    `/api/v1/blog-comments/${blogId}/comments`,
    commentMutationResponseSchema,
    { method: 'POST', headers: authHeaders(token), body: JSON.stringify({ content }) },
  )
}

export function deleteBlogComment(token: string, commentId: string) {
  return apiRequest<{
    success: boolean
    message: string
    data: { id: string; userId: string; blogId: string; content: string; createdAt: string }
  }>(
    `/api/v1/blog-comments/comments/${commentId}`,
    commentMutationResponseSchema,
    { method: 'DELETE', headers: authHeaders(token) },
  )
}
