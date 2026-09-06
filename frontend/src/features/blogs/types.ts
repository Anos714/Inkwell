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
}

export type BlogsResponse = {
  success: boolean
  message: string
  data: Blog[]
}
