import { useMutation } from '@tanstack/react-query'
import { setupApi } from '@/features/setup/services/setupApi'
import type { CreateHorarioDto, HorarioResponseDto } from '@/features/setup/services/setupApi'

interface CreateHorariosForSucursalArgs {
  sucursalId: number
  horarios: CreateHorarioDto[]
}

export function useCreateHorarios() {
  return useMutation({
    mutationFn: async ({ sucursalId, horarios }: CreateHorariosForSucursalArgs): Promise<HorarioResponseDto[]> => {
      const results: HorarioResponseDto[] = []
      for (const dto of horarios) {
        const result = await setupApi.createHorario(sucursalId, dto)
        results.push(result)
      }
      return results
    },
  })
}
