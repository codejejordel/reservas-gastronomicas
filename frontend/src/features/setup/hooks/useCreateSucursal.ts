import { useMutation } from '@tanstack/react-query'
import { setupApi } from '@/features/setup/services/setupApi'
import type { CreateSucursalDto } from '@/features/setup/services/setupApi'

export function useCreateSucursal() {
  return useMutation({
    mutationFn: (dto: CreateSucursalDto) => setupApi.createSucursal(dto),
  })
}
