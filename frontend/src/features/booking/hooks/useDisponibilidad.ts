import { useQuery } from '@tanstack/react-query'
import { getDisponibilidad, type DisponibilidadResponse } from '../services/bookingApi'

interface UseDisponibilidadParams {
  sucursalId: number | undefined
  desde: string | undefined
  hasta: string | undefined
  personas: number
}

export function useDisponibilidad({ sucursalId, desde, hasta, personas }: UseDisponibilidadParams) {
  return useQuery<DisponibilidadResponse, Error>({
    queryKey: ['disponibilidad', sucursalId, desde, hasta, personas],
    queryFn: () => getDisponibilidad(sucursalId!, desde!, hasta!, personas),
    enabled: !!sucursalId && !!desde && !!hasta,
    staleTime: 0,
    refetchInterval: 15_000, // 15 segundos
    refetchOnWindowFocus: true,
  })
}
