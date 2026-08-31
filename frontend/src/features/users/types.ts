export type UserRole = 'ADMIN_RESTAURANTE' | 'EMPLEADO_SUCURSAL'

export type UserStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE'

export interface DashboardUser {
  id: string
  fullName: string
  email: string
  role: UserRole
  status: UserStatus
  branch: string
  lastAccess: string | null
  createdAt: string
}

export interface NewDashboardUser {
  fullName: string
  email: string
  role: UserRole
  branch: string
}
