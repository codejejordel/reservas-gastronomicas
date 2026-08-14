import { apiFetch } from '@/shared/api/apiClient'
import type { LoginRequest, LoginResponse } from '@/features/auth/types'
import type { RegisterFormData } from '@/features/auth/schemas/registerSchema'

export interface RegisterResponse {
  id: number
  nombreCompleto: string
  email: string
  telefono: string | null
  dni: string | null
  rol: string
  activo: boolean
  onboardingCompleto: boolean
}

export async function loginRequest(data: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function registerRequest(data: RegisterFormData): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/api/usuario', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({
      nombreCompleto: data.name,
      email: data.email,
      password: data.password,
      telefono: data.phone,
      dni: null,
      rol: 'ADMIN_RESTAURANTE',
    }),
  })
}
