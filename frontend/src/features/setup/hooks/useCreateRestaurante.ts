import { useMutation } from '@tanstack/react-query'
import { setupApi } from '@/features/setup/services/setupApi'
import type { CreateRestauranteDto } from '@/features/setup/services/setupApi'

export function useCreateRestaurante() {
  return useMutation({
    mutationFn: (dto: CreateRestauranteDto) => setupApi.createRestaurante(dto),
  })
}
