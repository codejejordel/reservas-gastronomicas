import { z } from 'zod'

export function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const levels = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Muy débil', color: '#ba1a1a' },
    { score: 2, label: 'Débil', color: '#e85d04' },
    { score: 3, label: 'Regular', color: '#f4a261' },
    { score: 4, label: 'Fuerte', color: '#2d9d78' },
    { score: 5, label: 'Muy fuerte', color: '#00696b' },
  ]
  return levels[score] ?? levels[0]
}

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Ingresá tu nombre completo')
      .max(80, 'Nombre demasiado largo'),
    email: z
      .string()
      .min(1, 'El email es requerido')
      .email('Ingresá un email válido'),
    phone: z
      .string()
      .regex(/^\+?\d[\d\s-]{6,}$/, 'Ingresá un teléfono válido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Repetí tu contraseña'),
    terms: z.literal(true, { message: 'Debés aceptar los términos' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
