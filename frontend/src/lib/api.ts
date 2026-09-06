import { z } from 'zod'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

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
  const body: unknown = await response.json()

  if (!response.ok) {
    const message = z.object({ message: z.string() }).safeParse(body)
    throw new Error(message.success ? message.data.message : 'Something went wrong. Please try again.')
  }

  return schema ? schema.parse(body) : body
}
