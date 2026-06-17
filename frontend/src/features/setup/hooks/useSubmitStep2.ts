import { useState } from 'react'
import { useSetupWizard } from '@/features/setup/state/SetupWizardContext'
import { useCreateHorarios } from './useCreateHorarios'
import { mapWeekScheduleToHorarios } from '@/features/setup/services/setupMappers'

export function useSubmitStep2() {
  const { venues, schedule, ids, addHorarioIds, nextStep } = useSetupWizard()
  const createHorarios = useCreateHorarios()
  const [error, setError] = useState<Error | null>(null)
  const [isPending, setIsPending] = useState(false)

  const submit = async () => {
    if (!ids.restauranteId) {
      setError(new Error('No se encontró el restaurante. Volvé al paso anterior.'))
      return
    }

    const pendingVenues = venues.filter(v => {
      const sucursalId = ids.sucursalIds[v.id]
      return sucursalId && !ids.horariosBySucursal[sucursalId]
    })

    if (pendingVenues.length === 0) {
      nextStep()
      return
    }

    setIsPending(true)
    setError(null)

    try {
      for (const venue of pendingVenues) {
        const sucursalId = ids.sucursalIds[venue.id]
        const activeSchedule = schedule.overrides[venue.id] ?? schedule.global
        const horarios = mapWeekScheduleToHorarios(activeSchedule, sucursalId)
        const result = await createHorarios.mutateAsync({ sucursalId, horarios })
        addHorarioIds(sucursalId, result.map(h => h.id))
      }

      nextStep()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al crear horarios'))
    } finally {
      setIsPending(false)
    }
  }

  return { submit, isPending, error }
}
