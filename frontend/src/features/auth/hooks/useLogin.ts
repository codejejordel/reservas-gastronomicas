import { useMutation } from '@tanstack/react-query'
import type { LoginFormData } from '@/features/auth/schemas/loginSchema'

async function loginMock(data: LoginFormData): Promise<{ token: string }> {
  await new Promise((r) => setTimeout(r, 1200))
  if (data.email === 'error@test.com') throw new Error('Credenciales incorrectas')
  return { token: 'mock-token-123' }
}

export function useLogin() {
  return useMutation({
    mutationFn: loginMock,
  })
}
