import { useState } from 'react'
import { useSetupWizard } from '@/features/setup/state/SetupWizardContext'
import { useCreateSucursal } from './useCreateSucursal'
import { mapVenueToSucursalDto } from '@/features/setup/services/setupMappers'

export function useSubmitStep1() {
  const { venues, ids, addSucursalId, nextStep } = useSetupWizard()
  const createSucursal = useCreateSucursal()
  const [error, setError] = useState<Error | null>(null)
  const [isPending, setIsPending] = useState(false)

  const submit = async () => {
    if (!ids.restauranteId) {
      setError(new Error('No se encontró el restaurante. Volvé al paso anterior.'))
      return
    }

    const pendingVenues = venues.filter(v => !ids.sucursalIds[v.id])
    if (pendingVenues.length === 0) {
      nextStep()
      return
    }

    setIsPending(true)
    setError(null)

    try {
      for (const venue of pendingVenues) {
        const result = await createSucursal.mutateAsync(
          mapVenueToSucursalDto(venue, ids.restauranteId!),
        )
        addSucursalId(venue.id, result.id)
      }

      nextStep()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al crear sucursales'))
    } finally {
      setIsPending(false)
    }
  }

  return { submit, isPending, error }
}
