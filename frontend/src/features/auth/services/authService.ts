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
    skipAuth: true,
    body: JSON.stringify(data),
  })
}

export async function googleLoginRequest(credential: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/google', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ idToken: credential }),
  })
}

export interface PasswordResetRequestResponse { challengeId: string }
export interface PasswordResetVerifyResponse { resetToken: string }

export async function requestPasswordReset(email: string): Promise<PasswordResetRequestResponse> {
  return apiFetch<PasswordResetRequestResponse>('/api/auth/password-reset/request', {
    method: 'POST', skipAuth: true, body: JSON.stringify({ email }),
  })
}

export async function verifyPasswordReset(challengeId: string, code: string): Promise<PasswordResetVerifyResponse> {
  return apiFetch<PasswordResetVerifyResponse>('/api/auth/password-reset/verify', {
    method: 'POST', skipAuth: true, body: JSON.stringify({ challengeId, code }),
  })
}

export async function confirmPasswordReset(resetToken: string, password: string): Promise<void> {
  await apiFetch<void>('/api/auth/password-reset/confirm', {
    method: 'POST', skipAuth: true, body: JSON.stringify({ resetToken, password }),
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
    }),
  })
}
