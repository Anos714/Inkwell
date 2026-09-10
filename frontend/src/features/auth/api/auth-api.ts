import { apiRequest } from '../../../lib/api'
import { authResponseSchema } from '../schemas'
import { z } from 'zod'

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export function getCurrentUser(token: string) {
  return apiRequest('/api/v1/users/me', authResponseSchema, {
    headers: authHeaders(token),
  })
}

export function refreshSession() {
  return apiRequest('/api/v1/users/refresh', authResponseSchema, { method: 'POST' })
}

export function authenticateWithGoogle(code: string) {
  return apiRequest('/api/v1/users/auth/google', authResponseSchema, {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export function logout(token: string) {
  return apiRequest('/api/v1/users/logout', undefined, {
    method: 'POST',
    headers: authHeaders(token),
  })
}

const profileUpdateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    id: z.string(),
    username: z.string(),
    avatarUrl: z.string().nullable().optional(),
    role: z.enum(['user', 'admin']).optional(),
    updatedAt: z.string(),
  }),
})

export function updateProfile(token: string, username: string) {
  return apiRequest('/api/v1/users/me/', profileUpdateResponseSchema, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ username }),
  })
}

export function deleteAccount(token: string) {
  return apiRequest('/api/v1/users/me/', undefined, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}
