import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { LoginFormData } from '@/features/auth/schemas/loginSchema'
import { loginRequest } from '@/features/auth/services/authService'
import { useAuthStore } from '@/features/auth/store/authStore'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: LoginFormData) => loginRequest({ email: data.email, password: data.password }),
    onSuccess: (response) => {
      setAuth(response.token, {
        id: response.id,
        email: response.email,
        nombreCompleto: response.nombreCompleto,
        rol: response.rol,
        onboardingCompleto: response.onboardingCompleto,
      })
      navigate({ to: response.onboardingCompleto ? '/dashboard' : '/setup' })
    },
  })
}
