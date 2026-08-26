import { useAuthStore } from '@/features/auth/store/authStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export function apiAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  return path.startsWith('http') || path.startsWith('data:') ? path : `${BASE_URL}${path}`
}

export class ApiError extends Error {
  public readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function createApiError(status: number, message: string): ApiError {
  return new ApiError(status, message)
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options

  const headers: Record<string, string> = {}
  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const existingHeaders = fetchOptions.headers as Record<string, string> | undefined
  if (existingHeaders) {
    Object.assign(headers, existingHeaders)
  }

  if (!skipAuth) {
    const token = useAuthStore.getState().token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  let response: Response
  let data: unknown = null

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
    })
    data = await response.json().catch(() => null)
  } catch {
    throw createApiError(0, 'Error de conexión. Intentá de nuevo.')
  }

  if (!response.ok) {
    if (response.status === 401 && !skipAuth) {
      useAuthStore.getState().logout()
    }
    const message = data && typeof data === 'object' && 'message' in data
      ? (data.message as string)
      : 'Error en la solicitud'
    throw createApiError(response.status, message)
  }

  return data as T
}
