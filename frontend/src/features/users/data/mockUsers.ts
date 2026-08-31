import type { DashboardUser } from '../types'

export const MOCK_USERS: DashboardUser[] = [
  {
    id: 'usr-001',
    fullName: 'Martina López',
    email: 'martina@laparrilla.com',
    role: 'ADMIN_RESTAURANTE',
    status: 'ACTIVE',
    branch: 'Todos los locales',
    lastAccess: '2026-08-29T13:42:00-03:00',
    createdAt: '2026-05-12',
  },
  {
    id: 'usr-002',
    fullName: 'Tomás Silva',
    email: 'tomas@laparrilla.com',
    role: 'EMPLEADO_SUCURSAL',
    status: 'ACTIVE',
    branch: 'Palermo',
    lastAccess: '2026-08-29T10:18:00-03:00',
    createdAt: '2026-06-03',
  },
  {
    id: 'usr-003',
    fullName: 'Carla Méndez',
    email: 'carla@laparrilla.com',
    role: 'EMPLEADO_SUCURSAL',
    status: 'PENDING',
    branch: 'Belgrano',
    lastAccess: null,
    createdAt: '2026-08-27',
  },
  {
    id: 'usr-004',
    fullName: 'Nicolás Aguirre',
    email: 'nicolas@laparrilla.com',
    role: 'EMPLEADO_SUCURSAL',
    status: 'INACTIVE',
    branch: 'Palermo',
    lastAccess: '2026-07-18T19:05:00-03:00',
    createdAt: '2026-04-21',
  },
  {
    id: 'usr-005',
    fullName: 'Sofía Rojas',
    email: 'sofia@laparrilla.com',
    role: 'EMPLEADO_SUCURSAL',
    status: 'ACTIVE',
    branch: 'San Telmo',
    lastAccess: '2026-08-28T22:31:00-03:00',
    createdAt: '2026-07-15',
  },
]

export const USER_BRANCHES = ['Palermo', 'Belgrano', 'San Telmo']
