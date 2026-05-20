import { useMutation } from '@tanstack/react-query'
import type { RegisterFormData } from '@/features/auth/schemas/registerSchema'

async function registerMock(data: RegisterFormData): Promise<{ userId: string }> {
  await new Promise((r) => setTimeout(r, 1400))
  if (data.email === 'error@test.com') throw new Error('Este email ya está registrado')
  return { userId: 'mock-user-456' }
}

export function useRegister() {
  return useMutation({
    mutationFn: registerMock,
  })
}
