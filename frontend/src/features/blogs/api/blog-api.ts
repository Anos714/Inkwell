import { z } from 'zod'
import { apiRequest } from '../../../lib/api'
import type { BlogsResponse } from '../types'
import type { Blog, BlogInput, LikeResponse } from '../types'

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

export function getBlog(blogId: string) {
  return apiRequest<{ success: boolean; message: string; data: Blog }>(
    `/api/v1/blogs/${blogId}`,
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
