import { useQuery } from '@tanstack/react-query'
import { getReservasPorSucursal } from '../services/dashboardApi'

export function useReservasMes(sucursalId: number | null) {
  return useQuery({
    queryKey: ['reservas-mes', sucursalId],
    queryFn: () => getReservasPorSucursal(sucursalId!),
    enabled: !!sucursalId,
    staleTime: 5 * 60 * 1000,
  })
}
