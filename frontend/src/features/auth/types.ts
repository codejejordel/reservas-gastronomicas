export const RolUsuario = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_RESTAURANTE: 'ADMIN_RESTAURANTE',
  EMPLEADO_SUCURSAL: 'EMPLEADO_SUCURSAL',
  CLIENTE: 'CLIENTE',
} as const

export type RolUsuario = (typeof RolUsuario)[keyof typeof RolUsuario]

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  tipo: string
  id: number
  email: string
  nombreCompleto: string
  rol: RolUsuario
  onboardingCompleto: boolean
}
