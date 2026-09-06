import { apiRequest } from '../../../lib/api'
import { authResponseSchema } from '../schemas'

export function getCurrentUser(token: string) {
  return apiRequest('/api/v1/users/me', authResponseSchema, {
    headers: { Authorization: `Bearer ${token}` },
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
    headers: { Authorization: `Bearer ${token}` },
  })
}
