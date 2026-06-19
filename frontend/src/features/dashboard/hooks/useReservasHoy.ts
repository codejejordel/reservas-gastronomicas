import { useQuery } from '@tanstack/react-query'
import { getReservasPorSucursal } from '../services/dashboardApi'
import { POLLING_INTERVAL_MS } from '../constants'

function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function useReservasHoy(sucursalId: number | null) {
  return useQuery({
    queryKey: ['reservas-hoy', sucursalId],
    queryFn: () =>
      getReservasPorSucursal(sucursalId!, getTodayIso(), 'CONFIRMADA'),
    enabled: !!sucursalId,
    refetchInterval: POLLING_INTERVAL_MS,
    staleTime: 0,
  })
}
