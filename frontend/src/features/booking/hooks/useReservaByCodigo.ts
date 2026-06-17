import { useQuery } from '@tanstack/react-query'
import { getReservaByCodigo } from '../services/bookingApi'
import type { ReservaResponse } from '../services/bookingApi'

export function useReservaByCodigo(codigo: string | undefined) {
  return useQuery<ReservaResponse, Error>({
    queryKey: ['reserva-codigo', codigo],
    queryFn: () => getReservaByCodigo(codigo!),
    enabled: !!codigo,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
}
