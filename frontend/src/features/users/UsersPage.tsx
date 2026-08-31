import { useDeferredValue, useRef, useState } from 'react'
import { Search, UserCheck, UserPlus, UsersRound } from 'lucide-react'
import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { AddUserDialog } from './components/AddUserDialog'
import { UsersTable } from './components/UsersTable'
import { MOCK_USERS, USER_BRANCHES } from './data/mockUsers'
import type { DashboardUser, NewDashboardUser, UserRole, UserStatus } from './types'

type RoleFilter = 'ALL' | UserRole
type StatusFilter = 'ALL' | UserStatus

const controlClass =
  'min-h-11 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'

export function UsersPage() {
  const [users, setUsers] = useState<DashboardUser[]>(MOCK_USERS)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<RoleFilter>('ALL')
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase('es-AR'))

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !deferredSearch ||
      user.fullName.toLocaleLowerCase('es-AR').includes(deferredSearch) ||
      user.email.toLocaleLowerCase('es-AR').includes(deferredSearch)
    return (
      matchesSearch &&
      (role === 'ALL' || user.role === role) &&
      (status === 'ALL' || user.status === status)
    )
  })
  const clearFilters = () => {
    setSearch('')
    setRole('ALL')
    setStatus('ALL')
  }
  const hasFilters = search.length > 0 || role !== 'ALL' || status !== 'ALL'
  const activeUsers = users.filter((user) => user.status === 'ACTIVE').length
  const pendingUsers = users.filter((user) => user.status === 'PENDING').length

  const addUser = (newUser: NewDashboardUser) => {
    setUsers((current) => [
      {
        ...newUser,
        id: `local-${Date.now()}`,
        status: 'PENDING',
        lastAccess: null,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ])
    setDialogOpen(false)
  }

  return (
    <DashboardShell>
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Equipo y accesos</p>
              <h1 className="mt-1 text-2xl font-bold text-on-surface sm:text-3xl">Usuarios</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-on-surface-variant">
                Administrá quién puede operar tus locales y con qué rol.
              </p>
            </div>
            <button
              ref={addButtonRef}
              type="button"
              onClick={() => setDialogOpen(true)}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Agregar usuario
            </button>
          </div>

          <section aria-label="Resumen de usuarios" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Total', value: users.length, icon: UsersRound },
              { label: 'Activos', value: activeUsers, icon: UserCheck },
              { label: 'Pendientes', value: pendingUsers, icon: UserPlus },
            ].map(({ label, value, icon: Icon }, index) => (
              <div
                key={label}
                className={`rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 ${index === 2 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-on-surface-variant">{label}</p>
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <p className="mt-2 text-2xl font-bold text-on-surface">{value}</p>
              </div>
            ))}
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest" aria-labelledby="users-list-title">
            <div className="border-b border-outline-variant p-4 sm:p-5">
              <div>
                <h2 id="users-list-title" className="font-bold text-on-surface">Usuarios creados</h2>
                <p className="mt-0.5 text-xs text-on-surface-variant" aria-live="polite">
                  {filteredUsers.length} de {users.length} usuarios
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(240px,1fr)_190px_170px]">
                <label className="relative sm:col-span-2 lg:col-span-1">
                  <span className="sr-only">Buscar usuarios</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" aria-hidden="true" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por nombre o email"
                    className={`${controlClass} w-full pl-9`}
                  />
                </label>
                <label>
                  <span className="sr-only">Filtrar por rol</span>
                  <select value={role} onChange={(event) => setRole(event.target.value as RoleFilter)} className={`${controlClass} w-full`}>
                    <option value="ALL">Todos los roles</option>
                    <option value="ADMIN_RESTAURANTE">Administradores</option>
                    <option value="EMPLEADO_SUCURSAL">Empleados</option>
                  </select>
                </label>
                <label>
                  <span className="sr-only">Filtrar por estado</span>
                  <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} className={`${controlClass} w-full`}>
                    <option value="ALL">Todos los estados</option>
                    <option value="ACTIVE">Activos</option>
                    <option value="PENDING">Pendientes</option>
                    <option value="INACTIVE">Inactivos</option>
                  </select>
                </label>
              </div>
            </div>
            <UsersTable users={filteredUsers} hasFilters={hasFilters} onClearFilters={clearFilters} />
          </section>
        </div>
      </div>

      {dialogOpen && (
        <AddUserDialog
          branches={USER_BRANCHES}
          existingEmails={users.map((user) => user.email.toLowerCase())}
          returnFocusRef={addButtonRef}
          onClose={() => setDialogOpen(false)}
          onSubmit={addUser}
        />
      )}
    </DashboardShell>
  )
}
