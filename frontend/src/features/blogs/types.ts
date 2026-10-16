export type Blog = {
  id: string
  title: string
  slug: string
  description: string | null
  content: unknown
  coverImage: string | null
  tags: string[]
  isPublished: boolean
  views: number
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
  gifUrl: string | null
  parentId: string | null
  createdAt: string
  likesCount: number
  likedByMe: boolean
  user: {
    id: string
    username: string
    avatarUrl: string | null
  } | null
  replies: Omit<BlogComment, 'replies'>[]
}

export type CommentsResponse = {
  success: boolean
  message: string
  data: BlogComment[]
}

export type RecentComment = Omit<BlogComment, 'replies'> & {
  blog: {
    id: string
    title: string
    slug: string
  } | null
}

export type RecentCommentsResponse = {
  success: boolean
  message: string
  data: RecentComment[]
}

export type DashboardSummary = {
  totalBlogs: number
  publishedBlogs: number
  draftBlogs: number
  totalLikes: number
  totalComments: number
  totalViews: number
}
