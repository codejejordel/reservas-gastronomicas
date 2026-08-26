import { Search, LogOut, Menu } from 'lucide-react'
import { useCurrentUser, useAuthStore } from '@/features/auth/store/authStore'
import { useNavigate } from '@tanstack/react-router'
import { ThemeToggle } from '@/shared/theme/ThemeToggle'
import { SucursalSelector } from './SucursalSelector'
import type { SucursalDashboard } from '../types'
import { useSucursalSeleccionadaStore } from '../state/sucursalSeleccionadaStore'
import { ReservationNotifications } from './ReservationNotifications'

interface DashboardHeaderProps {
  sucursales?: SucursalDashboard[]
  isLoadingSucursales: boolean
  onMenuClick: () => void
}

export function DashboardHeader({ sucursales, isLoadingSucursales, onMenuClick }: DashboardHeaderProps) {
  const user = useCurrentUser()
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const sucursalId = useSucursalSeleccionadaStore((state) => state.sucursalId)
  const selectedBranch = sucursales?.find((branch) => branch.id === sucursalId)

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  const initials = user?.nombreCompleto
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U'

  return (
    <header className="h-16 flex items-center justify-between px-3 md:px-6 border-b border-outline-variant shrink-0 gap-2">
      {/* Left: Menu + Search */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
          aria-label="Abrir menú"
        >
          <Menu size={18} />
        </button>
        <div className="relative w-80 max-md:hidden">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-dim" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-surface-container-high border border-outline-variant text-[13px] text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            readOnly
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 md:gap-3">
        <div className="max-md:hidden">
          <SucursalSelector sucursales={sucursales} isLoading={isLoadingSucursales} />
        </div>

        <ReservationNotifications
          key={selectedBranch ? `${selectedBranch.restauranteId}:${selectedBranch.id}` : 'no-branch'}
          restauranteId={selectedBranch?.restauranteId}
          sucursalId={selectedBranch?.id}
        />

        <ThemeToggle />

        <div className="flex items-center gap-1 md:gap-2 pl-2 md:border-l border-outline-variant">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-bold text-primary">
            {initials}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[12px] text-on-surface-variant hover:text-error transition-colors px-2 py-1 rounded-lg hover:bg-error/5"
            title="Cerrar sesión"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  )
}
