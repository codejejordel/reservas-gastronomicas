import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresá un email válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  remember: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
