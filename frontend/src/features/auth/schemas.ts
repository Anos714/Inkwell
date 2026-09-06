import { z } from 'zod'

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  avatarUrl: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const authResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: authUserSchema.optional(),
  token: z.string().optional(),
})

export type AuthResponse = z.infer<typeof authResponseSchema>
