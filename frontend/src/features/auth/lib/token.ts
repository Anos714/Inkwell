type TokenClaims = {
  exp?: number
  role?: 'user' | 'admin'
}

function decodeTokenClaims(token: string): TokenClaims | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(json) as TokenClaims

    return {
      exp: typeof claims.exp === 'number' ? claims.exp : undefined,
      role: claims.role === 'admin' || claims.role === 'user' ? claims.role : undefined,
    }
  } catch {
    return null
  }
}

export function getTokenRole(token: string): 'user' | 'admin' | undefined {
  return decodeTokenClaims(token)?.role
}

// Returns the token's expiry as a millisecond epoch timestamp, or null when
// the token cannot be decoded.
export function getTokenExpMs(token: string): number | null {
  const exp = decodeTokenClaims(token)?.exp
  return typeof exp === 'number' ? exp * 1000 : null
}
