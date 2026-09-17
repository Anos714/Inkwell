import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authenticateWithGoogle, getCurrentUser, logout, refreshSession } from '../api/auth-api'
import type { AuthResponse } from '../schemas'
import { useAuthStore } from '../store/auth-store'
import { getTokenRole } from '../lib/token'
import { isApiError } from '../../../lib/api'

export const googleCallbackPath = '/api/auth/google/callback'
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
const googleRedirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI
  ?? `${window.location.origin}${googleCallbackPath}`

export function useAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { token, setSession, clearSession } = useAuthStore()
  const [notice, setNotice] = useState('')
  const refreshAttempted = useRef(false)
  const [refreshSettled, setRefreshSettled] = useState(false)

  // The /me lookup runs whenever we hold an access token. The token lives in the
  // queryKey so a refreshed token automatically triggers a re-fetch.
  const meQuery = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: () => getCurrentUser(token ?? ''),
    enabled: Boolean(token),
    retry: false,
    // Re-fetching /me on focus can fire while the access token is briefly
    // stale and trigger a false sign-out; the mount-time refresh below covers
    // session recovery instead.
    refetchOnWindowFocus: false,
  })

  const {
    mutate: refresh,
    isPending: isRefreshing,
  } = useMutation({
    mutationFn: refreshSession,
    onSuccess: (data: AuthResponse) => {
      if (!data.token) return
      // /refresh returns only a new access token, so keep the profile we
      // already have rather than blanking it mid-session.
      const currentUser = useAuthStore.getState().user
      setSession(
        data.token,
        data.user ? { ...data.user, role: getTokenRole(data.token) } : currentUser,
      )
    },
    onSettled: () => setRefreshSettled(true),
  })

  const loginMutation = useMutation({
    mutationFn: authenticateWithGoogle,
    onSuccess: (data: AuthResponse) => {
      if (!data.token || !data.user) {
        throw new Error('The server returned an incomplete authentication response.')
      }
      setSession(data.token, { ...data.user, role: getTokenRole(data.token) })
      setNotice('')
      navigate('/home', { replace: true })
    },
    onError: (error: Error) => setNotice(error.message),
  })

  // Silent refresh on every mount (except the OAuth callback route). The stored
  // access token expires after 15 minutes, but the httpOnly refresh cookie is
  // valid for 7 days — exchanging it keeps returning visitors signed in.
  useEffect(() => {
    const isGoogleCallback = window.location.pathname === googleCallbackPath

    if (isGoogleCallback || refreshAttempted.current) return

    refreshAttempted.current = true
    refresh()
  }, [refresh])

  useEffect(() => {
    if (meQuery.data?.user && token) {
      setSession(token, { ...meQuery.data.user, role: getTokenRole(token) })
    }

    // Only sign the user out once the silent refresh has settled AND /me
    // rejects the session outright (401). Transient failures must not log
    // anyone out — the token now rotates in the background every ~15 minutes,
    // and a one-off network blip during a rotation isn't a dead session.
    if (refreshSettled && isApiError(meQuery.error) && meQuery.error.status === 401 && !meQuery.isFetching) {
      clearSession()
    }
  }, [clearSession, meQuery.data, meQuery.error, meQuery.isFetching, refreshSettled, setSession, token])

  useEffect(() => {
    const callbackUrl = new URL(window.location.href)
    if (callbackUrl.pathname !== googleCallbackPath) return

    const error = callbackUrl.searchParams.get('error')
    const code = callbackUrl.searchParams.get('code')
    const returnedState = callbackUrl.searchParams.get('state')
    const expectedState = sessionStorage.getItem('google-auth-state')
    sessionStorage.removeItem('google-auth-state')
    window.history.replaceState({}, document.title, '/')

    if (error) {
      queueMicrotask(() => setNotice('Google sign-in was cancelled or could not be completed.'))
      return
    }
    if (!code || !returnedState || returnedState !== expectedState) {
      queueMicrotask(() => setNotice('The Google sign-in response was invalid. Please try again.'))
      return
    }
    loginMutation.mutate(code)
  }, [loginMutation])

  const login = () => {
    const state = crypto.randomUUID()
    sessionStorage.setItem('google-auth-state', state)
    const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authorizationUrl.search = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: googleRedirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'select_account',
    }).toString()
    window.location.assign(authorizationUrl.toString())
  }

  const logoutUser = () => {
    if (token) {
      logoutMutation.mutate()
    } else {
      clearSession()
    }
  }

  const logoutMutation = useMutation({
    mutationFn: () => logout(token ?? ''),
    onSettled: () => {
      clearSession()
      queryClient.clear()
    },
  })

  return {
    // The boot-time refresh shouldn't expose a loading state — it would flicker
    // the sign-out button on every page load for signed-in users.
    isLoading: (refreshSettled && isRefreshing) || loginMutation.isPending,
    notice,
    login,
    logout: logoutUser,
  }
}
