import { useEffect, useState } from 'react'
import { useCurrentUser } from '@/features/auth/store/authStore'
import { useSucursalSeleccionadaStore } from '../state/sucursalSeleccionadaStore'
import { getSucursalesPorRestaurante, getRestaurantePorAdmin } from '../services/dashboardApi'
import { useQuery } from '@tanstack/react-query'
import { ThemeProvider } from '@/shared/theme/ThemeProvider'
import { Sidebar } from './Sidebar'
import { DashboardHeader } from './DashboardHeader'
import { SucursalSelector } from './SucursalSelector'
import { HeroCard } from './HeroCard'
import { MetricCard } from './MetricCard'
import { ReservasCard } from './ReservasCard'
import { CalendarCard } from './CalendarCard'
import { HeatmapCard } from './HeatmapCard'
import { NewVenueDialog } from '@/features/settings/components/NewVenueDialog'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const user = useCurrentUser()
  const sucursalId = useSucursalSeleccionadaStore((s) => s.sucursalId)
  const setSucursalId = useSucursalSeleccionadaStore((s) => s.setSucursalId)

  const restauranteQuery = useQuery({
    queryKey: ['restaurante-by-admin', user?.id],
    queryFn: () => getRestaurantePorAdmin(user!.id),
    enabled: !!user?.id,
  })

  const sucursalesQuery = useQuery({
    queryKey: ['sucursales', restauranteQuery.data?.id],
    queryFn: () => getSucursalesPorRestaurante(restauranteQuery.data!.id),
    enabled: !!restauranteQuery.data?.id,
  })

  // Auto-seleccionar sucursal principal si no hay selección
  useEffect(() => {
    if (!sucursalId && sucursalesQuery.data?.length) {
      const principal = sucursalesQuery.data.find((s) => s.esPrincipal)
      setSucursalId(principal?.id ?? sucursalesQuery.data[0].id)
    }
  }, [sucursalId, sucursalesQuery.data, setSucursalId])

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 18) return 'Buenas tardes'
    return 'Buenas noches'
  })()

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-surface overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <DashboardHeader
            sucursales={sucursalesQuery.data}
            isLoadingSucursales={sucursalesQuery.isLoading}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-6">
              {/* Saludo */}
              <div className="mb-5">
                <h1 className="text-[22px] md:text-[26px] font-bold text-on-surface">
                  {greeting}, {user?.nombreCompleto?.split(' ')[0] ?? 'Usuario'}!
                </h1>
                <p className="text-[22px] md:text-[26px] font-bold text-on-surface-variant leading-tight">
                  ¿Qué querés hacer hoy?
                </p>
              </div>

              {/* Selector sucursal — mobile only */}
              <div className="md:hidden mb-4">
                <SucursalSelector sucursales={sucursalesQuery.data} isLoading={sucursalesQuery.isLoading} />
              </div>

              {/* Grid principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Metric Card 1 — Reservas Hoy */}
                <MetricCard
                  label="Reservas hoy"
                  icon="calendar"
                  queryKey="reservas-hoy"
                  sucursalId={sucursalId}
                  formatter={(data) => String(data?.length ?? 0)}
                  description="Total del día"
                />

                {/* Hero Card — col-span 2, row-span 2 */}
                <div className="md:col-span-2 md:row-span-2">
                  <HeroCard />
                </div>

                {/* Calendar */}
                <CalendarCard sucursalId={sucursalId} />

                {/* Metric Card 2 — Comensales */}
                <MetricCard
                  label="Comensales"
                  icon="users"
                  queryKey="reservas-hoy"
                  sucursalId={sucursalId}
                  formatter={(data) =>
                    String(data?.reduce((sum: number, r: { cantPersonas: number }) => sum + r.cantPersonas, 0) ?? 0)
                  }
                  description="Total del día"
                />

                {/* Reservas Próximas */}
                <div className="xl:col-span-1 md:row-span-2">
                  <ReservasCard sucursalId={sucursalId} />
                </div>

                {/* Metric Card 3 — Rating */}
                <MetricCard
                  label="Rating"
                  icon="star"
                  value={restauranteQuery.data?.ratingPromedioGlobal?.toFixed(2) ?? '—'}
                  description="Promedio global"
                />

                {/* Metric Card 4 — Asistencia */}
                <MetricCard
                  label="Asistencia"
                  icon="check"
                  queryKey="reservas-mes"
                  sucursalId={sucursalId}
                  formatter={(data) => {
                    const total = data?.length ?? 1
                    const noShow = data?.filter((r: { estado: string }) => r.estado === 'NO_SHOW').length ?? 0
                    return `${(((total - noShow) / total) * 100).toFixed(0)}%`
                  }}
                  description="Este mes"
                />

                {/* Metric Card 5 — Próxima */}
                <MetricCard
                  label="Próxima reserva"
                  icon="clock"
                  queryKey="reservas-hoy"
                  sucursalId={sucursalId}
                  formatter={(data) => {
                    const now = new Date()
                    const prox = data
                      ?.filter((r: { horaReserva: string }) => {
                        const [h, m] = r.horaReserva.split(':').map(Number)
                        return h * 60 + m >= now.getHours() * 60 + now.getMinutes()
                      })
                      ?.sort((a: { horaReserva: string }, b: { horaReserva: string }) =>
                        a.horaReserva.localeCompare(b.horaReserva)
                      )[0]
                    return prox?.horaReserva ?? '—'
                  }}
                  description="Más cercana"
                />

                {/* Heatmap */}
                <div className="xl:col-span-2">
                  <HeatmapCard sucursalId={sucursalId} />
                </div>
              </div>
            </div>
          </div>
        </main>
        <NewVenueDialog />
      </div>
    </ThemeProvider>
  )
}
