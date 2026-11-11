import { refreshSession } from '../api/auth-api'
import { getTokenRole } from '../lib/token'
import { useAuthStore } from './auth-store'

let pending: Promise<boolean> | null = null

/**
 * Exchange the httpOnly refresh cookie for an access token, once per page load.
 * Admin routes are bookmarked and hard-reloaded more than public ones, and the
 * access token is deliberately never persisted, so the admin shell has to be
 * able to boot itself instead of assuming a live session in memory.
 */
export function ensureSession(): Promise<boolean> {
  if (useAuthStore.getState().token) return Promise.resolve(true)
  if (pending) return pending

  pending = refreshSession()
    .then((data) => {
      if (!data.token) return false
      const currentUser = useAuthStore.getState().user
      useAuthStore.getState().setSession(
        data.token,
        data.user
          ? { ...data.user, role: getTokenRole(data.token) }
          : currentUser,
      )
      return true
    })
    .catch(() => false)

  return pending
}
