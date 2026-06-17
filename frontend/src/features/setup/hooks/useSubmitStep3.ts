import { useState } from 'react'
import { useSetupWizard } from '@/features/setup/state/SetupWizardContext'
import { useCreateMesas } from './useCreateMesas'
import { mapTablesToMesaDtos } from '@/features/setup/services/setupMappers'

export function useSubmitStep3() {
  const { venues, tables, ids, addMesaIds, nextStep } = useSetupWizard()
  const createMesas = useCreateMesas()
  const [error, setError] = useState<Error | null>(null)
  const [isPending, setIsPending] = useState(false)

  const submit = async () => {
    if (!ids.restauranteId) {
      setError(new Error('No se encontró el restaurante. Volvé al paso anterior.'))
      return
    }

    const pendingVenues = venues.filter(v => {
      const sucursalId = ids.sucursalIds[v.id]
      return sucursalId && !ids.mesasBySucursal[sucursalId]
    })

    if (pendingVenues.length === 0) {
      nextStep()
      return
    }

    setIsPending(true)
    setError(null)

    try {
      const results = await Promise.allSettled(
        pendingVenues.map(venue => {
          const sucursalId = ids.sucursalIds[venue.id]
          const activeTables = tables.overrides[venue.id] ?? tables.global
          const mesaDtos = mapTablesToMesaDtos(activeTables, sucursalId)
          if (mesaDtos.length === 0) return Promise.resolve([])
          return createMesas.mutateAsync(mesaDtos)
        }),
      )

      const failed = results.filter(r => r.status === 'rejected')
      if (failed.length > 0) {
        throw new Error(`${failed.length} sucursal(es) con error en mesas`)
      }

      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          const sucursalId = ids.sucursalIds[pendingVenues[i].id]
          addMesaIds(sucursalId, result.value.map(m => m.id))
        }
      })

      nextStep()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al crear mesas'))
    } finally {
      setIsPending(false)
    }
  }

  return { submit, isPending, error }
}
