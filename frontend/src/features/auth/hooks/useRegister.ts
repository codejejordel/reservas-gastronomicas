import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { RegisterFormData } from '@/features/auth/schemas/registerSchema'
import { registerRequest } from '@/features/auth/services/authService'

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterFormData) => registerRequest(data),
    onSuccess: () => {
      navigate({ to: '/setup' })
    },
  })
}
