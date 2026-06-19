import { useMutation, useQueryClient } from '@tanstack/react-query'
import { completarReserva } from '../services/dashboardApi'

export function useCompletarReserva() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: completarReserva,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservas-hoy'] })
      qc.invalidateQueries({ queryKey: ['reservas-mes'] })
    },
  })
}
