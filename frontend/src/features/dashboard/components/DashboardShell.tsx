import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useCurrentUser } from '@/features/auth/store/authStore'
import { getRestaurantePorAdmin, getSucursalesPorRestaurante } from '../services/dashboardApi'
import { ThemeProvider } from '@/shared/theme/ThemeProvider'
import { Sidebar } from './Sidebar'
import { DashboardHeader } from './DashboardHeader'
import { NewVenueDialog } from '@/features/settings/components/NewVenueDialog'

export function DashboardShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const user = useCurrentUser()
  const restaurantQuery = useQuery({
    queryKey: ['restaurante-by-admin', user?.id],
    queryFn: () => getRestaurantePorAdmin(user!.id),
    enabled: !!user?.id,
  })
  const branchesQuery = useQuery({
    queryKey: ['sucursales', restaurantQuery.data?.id],
    queryFn: () => getSucursalesPorRestaurante(restaurantQuery.data!.id),
    enabled: !!restaurantQuery.data?.id,
  })

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-surface overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <DashboardHeader sucursales={branchesQuery.data} isLoadingSucursales={branchesQuery.isLoading} onMenuClick={() => setSidebarOpen(true)} />
          {children}
          <NewVenueDialog />
        </main>
      </div>
    </ThemeProvider>
  )
}
