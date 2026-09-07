export type Blog = {
  id: string
  title: string
  slug: string
  description: string | null
  content: unknown
  coverImage: string | null
  tags: string[]
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  likesCount?: number
}

export type BlogsResponse = {
  success: boolean
  message: string
  data: Blog[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export type BlogInput = {
  title: string
  slug: string
  description?: string
  content: unknown
  coverImage?: string
  tags?: string[]
  isPublished?: boolean
}

export type LikeResponse = {
  success: boolean
  liked: boolean
  totalLikes: number
  message: string
}

export type BlogComment = {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    username: string
    avatarUrl: string | null
  } | null
}

export type CommentsResponse = {
  success: boolean
  message: string
  data: BlogComment[]
}
