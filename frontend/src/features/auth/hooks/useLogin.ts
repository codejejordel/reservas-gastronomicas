import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { LoginFormData } from '@/features/auth/schemas/loginSchema'
import { loginWithSupabase } from '@/features/auth/services/authSupabaseService'

export function useLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginFormData) =>
      loginWithSupabase({ email: data.email, password: data.password }),
    onSuccess: () => {
      navigate({ to: '/dashboard' })
    },
  })
}
