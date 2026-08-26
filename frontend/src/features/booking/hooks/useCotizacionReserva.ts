import { useQuery } from '@tanstack/react-query'
import { getCotizacionReserva, type CotizacionReserva } from '../services/bookingApi'

export function useCotizacionReserva(sucursalId: number | undefined, personas: number) {
  return useQuery<CotizacionReserva, Error>({
    queryKey: ['cotizacion-reserva', sucursalId, personas],
    queryFn: ({ signal }) => getCotizacionReserva(sucursalId!, personas, signal),
    enabled: !!sucursalId && personas > 0,
    placeholderData: undefined,
    staleTime: 0,
  })
}
