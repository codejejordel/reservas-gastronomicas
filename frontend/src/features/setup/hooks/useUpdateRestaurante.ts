import { useMutation } from '@tanstack/react-query'
import { setupApi } from '@/features/setup/services/setupApi'
import type { UpdateRestauranteDto } from '@/features/setup/services/setupApi'

export function useUpdateRestaurante() {
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateRestauranteDto }) =>
      setupApi.updateRestaurante(id, dto),
  })
}
