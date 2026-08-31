import type { UserRole, UserStatus } from '../types'

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  ADMIN_RESTAURANTE: {
    label: 'Administrador',
    className: 'bg-primary/10 text-primary',
  },
  EMPLEADO_SUCURSAL: {
    label: 'Empleado',
    className: 'bg-secondary-container text-on-secondary-container',
  },
}

const statusConfig: Record<UserStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Activo',
    className: 'bg-success-container text-on-success-container',
  },
  PENDING: {
    label: 'Pendiente',
    className: 'bg-warning-container text-on-warning-container',
  },
  INACTIVE: {
    label: 'Inactivo',
    className: 'bg-surface-container-high text-on-surface-variant',
  },
}

interface UserPillProps {
  kind: 'role' | 'status'
  value: UserRole | UserStatus
}

export function UserPill({ kind, value }: UserPillProps) {
  const config =
    kind === 'role'
      ? roleConfig[value as UserRole]
      : statusConfig[value as UserStatus]

  return (
    <span
      className={`inline-flex w-fit items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${config.className}`}
    >
      {config.label}
    </span>
  )
}
