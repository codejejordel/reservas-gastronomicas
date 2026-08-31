import { Clock3, MapPin, UserRoundX } from 'lucide-react'
import type { DashboardUser } from '../types'
import { UserPill } from './UserPill'

interface UsersTableProps {
  users: DashboardUser[]
  hasFilters: boolean
  onClearFilters: () => void
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function formatLastAccess(value: string | null) {
  if (!value) return 'Todavía no ingresó'

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function UserIdentity({ user }: { user: DashboardUser }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary"
        aria-hidden="true"
      >
        {initials(user.fullName)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-on-surface">
          {user.fullName}
        </p>
        <p className="truncate text-xs text-on-surface-variant">{user.email}</p>
      </div>
    </div>
  )
}

export function UsersTable({
  users,
  hasFilters,
  onClearFilters,
}: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant">
          <UserRoundX className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-base font-bold text-on-surface">
          {hasFilters ? 'No encontramos usuarios' : 'Todavía no hay usuarios'}
        </h2>
        <p className="mt-1 max-w-sm text-sm leading-6 text-on-surface-variant">
          {hasFilters
            ? 'Probá con otro nombre, email, rol o estado.'
            : 'Agregá el primer integrante para empezar a organizar tu equipo.'}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-4 min-h-11 rounded-xl px-4 text-sm font-bold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left">
          <caption className="sr-only">Usuarios del restaurante</caption>
          <thead className="border-b border-outline-variant bg-surface-container-low">
            <tr className="text-xs font-bold text-on-surface-variant">
              <th scope="col" className="px-5 py-3.5">Usuario</th>
              <th scope="col" className="px-4 py-3.5">Rol</th>
              <th scope="col" className="px-4 py-3.5">Local</th>
              <th scope="col" className="px-4 py-3.5">Estado</th>
              <th scope="col" className="px-5 py-3.5">Último acceso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-surface-container-low/70">
                <td className="px-5 py-4"><UserIdentity user={user} /></td>
                <td className="px-4 py-4"><UserPill kind="role" value={user.role} /></td>
                <td className="px-4 py-4 text-sm text-on-surface-variant">{user.branch}</td>
                <td className="px-4 py-4"><UserPill kind="status" value={user.status} /></td>
                <td className="px-5 py-4 text-sm text-on-surface-variant">
                  {formatLastAccess(user.lastAccess)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        {users.map((user) => (
          <article key={user.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <UserIdentity user={user} />
            <div className="mt-4 flex flex-wrap gap-2">
              <UserPill kind="role" value={user.role} />
              <UserPill kind="status" value={user.status} />
            </div>
            <div className="mt-4 grid gap-2 border-t border-outline-variant pt-3 text-xs text-on-surface-variant">
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {user.branch}
              </span>
              <span className="flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {formatLastAccess(user.lastAccess)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
