import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authenticateWithGoogle, getCurrentUser, logout, refreshSession } from '../api/auth-api'
import type { AuthResponse } from '../schemas'
import { useAuthStore } from '../store/auth-store'

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

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => getCurrentUser(token ?? ''),
    enabled: Boolean(token),
    retry: false,
  })

  const {
    mutate: refresh,
    isPending: isRefreshing,
  } = useMutation({
    mutationFn: refreshSession,
    onSuccess: (data: AuthResponse) => {
      if (data.token) setSession(data.token, data.user ?? null)
    },
    onError: clearSession,
  })

  const loginMutation = useMutation({
    mutationFn: authenticateWithGoogle,
    onSuccess: (data: AuthResponse) => {
      if (!data.token || !data.user) {
        throw new Error('The server returned an incomplete authentication response.')
      }
      setSession(data.token, data.user)
      setNotice('')
      navigate('/home', { replace: true })
    },
    onError: (error: Error) => setNotice(error.message),
  })

  useEffect(() => {
    const isGoogleCallback = window.location.pathname === googleCallbackPath

    if (!token && !isGoogleCallback && !refreshAttempted.current) {
      refreshAttempted.current = true
      refresh()
    }
  }, [refresh, token])

  useEffect(() => {
    if (meQuery.data?.user && token) setSession(token, meQuery.data.user)
    if (meQuery.error) clearSession()
  }, [clearSession, meQuery.data, meQuery.error, setSession, token])

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
    isLoading: isRefreshing || loginMutation.isPending,
    notice,
    login,
    logout: logoutUser,
  }
}
