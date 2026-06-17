import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RolUsuario } from '@/features/auth/types'

export interface AuthUser {
  id: number
  email: string
  nombreCompleto: string
  rol: RolUsuario
  onboardingCompleto: boolean
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  setAuth: (token: string, user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

export const useIsAuthenticated = () => useAuthStore((s) => !!s.token)
export const useCurrentUser = () => useAuthStore((s) => s.user)
