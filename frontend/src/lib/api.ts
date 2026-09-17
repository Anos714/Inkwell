import { z } from 'zod'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// Errors thrown by apiRequest carry the HTTP status so callers can tell a dead
// session (401) apart from a transient network or server failure.
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T>
export async function apiRequest(path: string, schema?: undefined, init?: RequestInit): Promise<unknown>
export async function apiRequest<T>(
  path: string,
  schema?: z.ZodType<T>,
  init?: RequestInit,
): Promise<T | unknown> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const responseText = await response.text()
  let body: unknown = null

  if (responseText.trim()) {
    try {
      body = JSON.parse(responseText) as unknown
    } catch {
      if (!response.ok) {
        throw new ApiError(`Request failed with status ${response.status}.`, response.status)
      }
      throw new Error('The server returned an invalid response.')
    }
  }

  if (!response.ok) {
    const message = z.object({ message: z.string() }).safeParse(body)
    throw new ApiError(
      message.success
        ? message.data.message
        : `Request failed with status ${response.status}.`,
      response.status,
    )
  }

  return schema ? schema.parse(body) : body
}
