import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { googleLoginRequest } from '@/features/auth/services/authService'
import { useAuthStore } from '@/features/auth/store/authStore'

export function useGoogleLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: googleLoginRequest,
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
