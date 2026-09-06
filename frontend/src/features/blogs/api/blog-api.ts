import { z } from 'zod'
import { apiRequest } from '../../../lib/api'
import type { BlogsResponse } from '../types'

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
})

const blogsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(blogSchema),
})

export function getPublishedBlogs() {
  return apiRequest<BlogsResponse>('/api/v1/blogs', blogsResponseSchema)
}
