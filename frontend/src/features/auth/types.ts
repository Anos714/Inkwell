export type AuthUser = {
  id: string
  email: string
  username: string
  avatarUrl?: string | null
  role?: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}
