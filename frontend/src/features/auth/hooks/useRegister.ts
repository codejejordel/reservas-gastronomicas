import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { RegisterFormData } from '@/features/auth/schemas/registerSchema'
import { registerRequest, loginRequest } from '@/features/auth/services/authService'
import { useAuthStore } from '@/features/auth/store/authStore'

export function useRegister() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: async (data: RegisterFormData) => {
      await registerRequest(data)
      const loginResponse = await loginRequest({ email: data.email, password: data.password })
      return loginResponse
    },
    onSuccess: (loginResponse) => {
      setAuth(loginResponse.token, {
        id: loginResponse.id,
        email: loginResponse.email,
        nombreCompleto: loginResponse.nombreCompleto,
        rol: loginResponse.rol,
        onboardingCompleto: loginResponse.onboardingCompleto,
      })
      navigate({ to: '/setup' })
    },
  })
}
