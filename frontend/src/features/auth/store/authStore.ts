import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  setSession: (token: string, user: User) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: true,
      setSession: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)

export const useIsAuthenticated = () => useAuthStore((s) => !!s.token)
export const useCurrentUser = () => useAuthStore((s) => s.user)
