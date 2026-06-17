import { useAuthStore } from '@/features/auth/store/authStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export interface ApiError {
  status: number
  message: string
}

export function createApiError(status: number, message: string): ApiError {
  return { status, message }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
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
    const message = data && typeof data === 'object' && 'message' in data 
      ? (data.message as string)
      : 'Error en la solicitud'
    throw createApiError(response.status, message)
  }

  return data as T
}
