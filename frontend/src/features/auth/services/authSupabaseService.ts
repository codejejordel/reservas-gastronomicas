import { supabase } from '@/shared/supabase/supabaseClient'
import type { AuthError } from '@supabase/supabase-js'

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
