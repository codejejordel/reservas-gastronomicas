import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessageSquare,
  ListTodo,
  Sparkles,
  Settings,
  ChevronRight,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { useNavigate, useLocation } from '@tanstack/react-router'

const navGeneral = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Reservas', icon: CalendarDays, href: '#' },
  { label: 'Mesas', icon: Users, href: '#' },
  { label: 'Mensajes', icon: MessageSquare, href: '#' },
]

const navMore = [
  { label: 'Calendario', icon: ListTodo, href: '#' },
  { label: 'Configuración', icon: Settings, href: '#' },
]

const team = [
  { name: 'Darín Petty', initial: 'DP' },
  { name: 'Flux Academy', initial: 'FA' },
  { name: 'Michelle Choi', initial: 'MC' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (href: string) => location.pathname === href

  return (
    <div className="flex flex-col h-full">
      {/* Logo + cerrar */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <UtensilsCrossed size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface leading-tight">Turnify</p>
            <p className="text-[11px] text-on-surface-variant leading-tight">Gestión de reservas</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* GENERAL */}
      <div className="px-4 mt-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-dim px-3 mb-2">
          General
        </p>
        <nav className="flex flex-col gap-0.5">
          {navGeneral.map((item) => (
            <button
              key={item.label}
              onClick={() => { navigate({ to: item.href }); onClose?.() }}
              className={
                `flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ` +
                (isActive(item.href)
                  ? 'bg-surface-container-high text-on-surface'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50')
              }
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* MÁS */}
      <div className="px-4 mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-dim px-3 mb-2">
          Más
        </p>
        <nav className="flex flex-col gap-0.5">
          {navMore.map((item) => (
            <button
              key={item.label}
              onClick={() => { navigate({ to: item.href }); onClose?.() }}
              className={
                `flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ` +
                (item.label === 'Configuración'
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50')
              }
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* EQUIPO */}
      <div className="px-4 mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-dim px-3 mb-2">
          Equipo
        </p>
        <nav className="flex flex-col gap-0.5">
          {team.map((member) => (
            <div
              key={member.name}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-on-surface-variant"
            >
              <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface">
                {member.initial}
              </div>
              <span>{member.name}</span>
            </div>
          ))}
          <button className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-on-surface-dim hover:text-on-surface-variant transition-colors">
            <ChevronRight size={14} />
            Ver más (14)
          </button>
        </nav>
      </div>

      {/* Upgrade */}
      <div className="mt-auto px-4 pb-5">
        <button className="w-full py-2.5 px-4 rounded-2xl text-[13px] font-semibold text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #9d7cff 0%, #ff6b9d 50%, #ff9a56 100%)',
          }}
        >
          <Sparkles size={14} />
          Mejorar plan
        </button>
      </div>
    </div>
  )
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop — sidebar estático */}
      <aside className="hidden md:flex w-60 h-screen flex-col bg-surface-container border-r border-outline-variant shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile — drawer con overlay */}
      <div className="md:hidden">
        {/* Overlay */}
        <div
          onClick={onClose}
          className={
            `fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ` +
            (isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')
          }
          aria-hidden="true"
        />
        {/* Drawer */}
        <aside
          className={
            `fixed inset-y-0 left-0 z-50 w-60 h-screen bg-surface-container border-r border-outline-variant ` +
            `transform transition-transform duration-300 ease-out ` +
            (isOpen ? 'translate-x-0' : '-translate-x-full')
          }
        >
          <SidebarContent onClose={onClose} />
        </aside>
      </div>
    </>
  )
}
