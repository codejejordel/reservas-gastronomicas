import { apiFetch } from '@/shared/api/apiClient'
import type { LoginRequest, LoginResponse } from '@/features/auth/types'

export async function loginRequest(data: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
