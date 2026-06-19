import { useMutation, useQueryClient } from '@tanstack/react-query'
import { marcarNoShow } from '../services/dashboardApi'

export function useMarcarNoShow() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: marcarNoShow,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservas-hoy'] })
      qc.invalidateQueries({ queryKey: ['reservas-mes'] })
    },
  })
}
