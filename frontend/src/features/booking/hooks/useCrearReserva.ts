import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearReservaPublica, type CrearReservaPublicaPayload, type ReservaResponse } from '../services/bookingApi'

export function useCrearReserva() {
  const queryClient = useQueryClient()

  return useMutation<ReservaResponse, Error, CrearReservaPublicaPayload>({
    mutationFn: crearReservaPublica,
    onSuccess: (data) => {
      // Invalidar disponibilidad para la sucursal y fecha
      queryClient.invalidateQueries({
        queryKey: ['disponibilidad', data.sucursalId],
      })
    },
  })
}
