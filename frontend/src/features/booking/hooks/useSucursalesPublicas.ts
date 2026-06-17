import { useQuery } from '@tanstack/react-query'
import { getSucursalesByRestaurante } from '../services/bookingApi'
import type { SucursalPublic } from '../types/bookingTypes'

export function useSucursalesPublicas(restauranteId: number | undefined) {
  return useQuery<SucursalPublic[], Error>({
    queryKey: ['sucursales-publicas', restauranteId],
    queryFn: () => getSucursalesByRestaurante(restauranteId!),
    enabled: !!restauranteId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}
