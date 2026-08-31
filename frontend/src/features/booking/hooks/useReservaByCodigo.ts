import { useQuery } from '@tanstack/react-query'
import { getReservaPublicStatus } from '../services/bookingApi'
import type { ReservaPublicStatus } from '../services/bookingApi'

export function useReservaByCodigo(codigo: string | undefined, accessToken: string | undefined) {
  return useQuery<ReservaPublicStatus, Error>({
    queryKey: ['reserva-public-status', codigo, accessToken],
    queryFn: () => getReservaPublicStatus(codigo!, accessToken!),
    enabled: !!codigo && !!accessToken,
    staleTime: 15 * 1000,
    retry: false,
  })
}
