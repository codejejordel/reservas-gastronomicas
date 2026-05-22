import { useEffect } from 'react'
import { supabase } from '@/shared/supabase/supabaseClient'
import { useAuthStore } from '@/features/auth/store/authStore'

export function useAuthListener() {
  const setSession = useAuthStore((s) => s.setSession)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session.access_token, session.user)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session.access_token, session.user)
      } else {
        clearAuth()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setSession, clearAuth, setLoading])
}
