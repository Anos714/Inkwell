import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '../types'

type AuthState = {
  token: string | null
  user: AuthUser | null
  setSession: (token: string, user: AuthUser | null) => void
  clearSession: () => void
}

type PersistedAuthState = Pick<AuthState, 'user'>

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    {
      name: 'inkwell-auth',
      version: 1,
      // The access token is intentionally excluded: it must never be readable
      // from storage, where an XSS could exfiltrate and reuse it. Keeping the
      // profile persisted means returning users don't see a signed-out flash
      // while the httpOnly refresh cookie re-boots a fresh token on mount.
      partialize: (state): PersistedAuthState => ({ user: state.user }),
      // Earlier revisions stored the token beside the profile. Drop it on the
      // way in so a stale token can never be rehydrated back into memory.
      migrate: (persistedState): PersistedAuthState => {
        if (persistedState && typeof persistedState === 'object' && 'user' in persistedState) {
          return { user: (persistedState as PersistedAuthState).user }
        }
        return { user: null }
      },
    },
  ),
)
