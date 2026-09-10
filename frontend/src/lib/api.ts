import { z } from 'zod'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

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
        throw new Error(`Request failed with status ${response.status}.`)
      }
      throw new Error('The server returned an invalid response.')
    }
  }

  if (!response.ok) {
    const message = z.object({ message: z.string() }).safeParse(body)
    throw new Error(
      message.success
        ? message.data.message
        : `Request failed with status ${response.status}.`,
    )
  }

  return schema ? schema.parse(body) : body
}
