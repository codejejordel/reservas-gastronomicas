import { supabase } from '@/shared/supabase/supabaseClient'
import { apiFetch } from '@/shared/api/apiClient'
import type { AuthError } from '@supabase/supabase-js'
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
      rol: 'CLIENTE',
    }),
  })
}

export interface SupabaseLoginCredentials {
  email: string
  password: string
}

export async function loginWithSupabase({ email, password }: SupabaseLoginCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw normalizeSupabaseError(error)
  }

  return data
}

export async function logoutFromSupabase() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw normalizeSupabaseError(error)
  }
}

export async function getSupabaseSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw normalizeSupabaseError(error)
  }
  return data.session
}

export async function getSupabaseUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    throw normalizeSupabaseError(error)
  }
  return data.user
}

function normalizeSupabaseError(error: AuthError): Error {
  const message = error.message || 'Error de autenticación'
  return new Error(message)
}
