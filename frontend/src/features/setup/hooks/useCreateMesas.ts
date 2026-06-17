import { useMutation } from '@tanstack/react-query'
import { setupApi } from '@/features/setup/services/setupApi'
import type { CreateMesaDto, MesaResponseDto } from '@/features/setup/services/setupApi'

export function useCreateMesas() {
  return useMutation({
    mutationFn: async (mesas: CreateMesaDto[]): Promise<MesaResponseDto[]> => {
      const results: MesaResponseDto[] = []
      for (const dto of mesas) {
        const result = await setupApi.createMesa(dto)
        results.push(result)
      }
      return results
    },
  })
}
