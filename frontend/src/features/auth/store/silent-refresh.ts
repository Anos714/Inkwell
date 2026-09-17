import { useAuthStore } from './auth-store'
import { refreshSession } from '../api/auth-api'
import { getTokenExpMs, getTokenRole } from '../lib/token'
import { isApiError } from '../../../lib/api'
import { queryClient } from '../../../lib/query-client'

// Swap in a fresh access token shortly before the current one expires. The
// 15-minute lifetime is enforced server-side; this just books the exchange
// ahead of it so authenticated requests never see a stale token.
const REFRESH_LEAD_TIME_MS = 60_000
// Back off repeated exchanges so a persistently failing /refresh can't spin.
const MIN_REFRESH_INTERVAL_MS = 10_000

let timer: ReturnType<typeof setTimeout> | undefined
let isRefreshing = false
let lastRefreshAt = 0
let unsubscribe: (() => void) | undefined

/**
 * Keeps a valid access token in memory for the lifetime of the page. Runs
 * entirely outside React, so it fires exactly once per token regardless of how
 * many components mount the auth hook.
 */
export function startSilentRefresh(): void {
  if (unsubscribe) return

  unsubscribe = useAuthStore.subscribe((state, previousState) => {
    if (state.token !== previousState.token) schedule(state.token)
  })
  document.addEventListener('visibilitychange', handleVisibilityChange)
  schedule(useAuthStore.getState().token)
}

export function stopSilentRefresh(): void {
  if (timer) clearTimeout(timer)
  timer = undefined
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  unsubscribe?.()
  unsubscribe = undefined
}

function schedule(token: string | null): void {
  if (timer) {
    clearTimeout(timer)
    timer = undefined
  }

  if (!token) return

  const expiresAtMs = getTokenExpMs(token)
  if (!expiresAtMs) return

  const delay = expiresAtMs - Date.now() - REFRESH_LEAD_TIME_MS

  // Already inside (or past) the refresh window — exchange immediately.
  if (delay <= 0) {
    void refreshAccessToken()
    return
  }

  timer = setTimeout(() => void refreshAccessToken(), delay)
}

async function refreshAccessToken(): Promise<void> {
  const now = Date.now()
  if (isRefreshing || now - lastRefreshAt < MIN_REFRESH_INTERVAL_MS) return

  isRefreshing = true
  lastRefreshAt = now

  try {
    const response = await refreshSession()

    if (!response.token) {
      signOut()
      return
    }

    // /refresh returns only a new access token, so carry the persisted profile
    // over instead of blanking it.
    const currentUser = useAuthStore.getState().user
    useAuthStore.getState().setSession(
      response.token,
      response.user ? { ...response.user, role: getTokenRole(response.token) } : currentUser,
    )
    // The store subscription re-arms the timer against the new expiry.
  } catch (error) {
    // A 401 means the httpOnly refresh cookie is gone or invalid — the session
    // is genuinely dead. Anything else is transient and left for the next
    // focus or expiry event to retry, so the user never notices.
    if (isApiError(error) && error.status === 401) signOut()
  } finally {
    isRefreshing = false
  }
}

function handleVisibilityChange(): void {
  if (document.visibilityState !== 'visible') return

  const { token } = useAuthStore.getState()
  if (!token) return

  // Background timers are throttled, so re-evaluate whenever the tab regains
  // focus — a session that went stale while idle recovers silently.
  const expiresAtMs = getTokenExpMs(token)
  if (!expiresAtMs || expiresAtMs - Date.now() <= REFRESH_LEAD_TIME_MS) {
    void refreshAccessToken()
  }
}

function signOut(): void {
  useAuthStore.getState().clearSession()
  queryClient.clear()
}
