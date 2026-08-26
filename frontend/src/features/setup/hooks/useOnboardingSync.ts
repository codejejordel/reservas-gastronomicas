import { useCallback } from 'react'
import { setupApi } from '@/features/setup/services/setupApi'
import type { PersistedIds, RestaurantData, Venue } from '@/features/setup/state/setupTypes'

export interface OnboardingProgressData {
  restauranteId?: number
  sucursalIds?: Record<number, number>
  horariosBySucursal?: Record<number, number[]>
  mesasBySucursal?: Record<number, number[]>
  restaurant?: RestaurantData
  venues?: Venue[]
}

export interface RestoredWizardState {
  ids: Partial<PersistedIds>
  restaurant?: RestaurantData
  venues?: Venue[]
  pasoActual: number
}

export function progressDataToState(data: Record<string, unknown>): RestoredWizardState {
  return {
    ids: {
      restauranteId: typeof data.restauranteId === 'number' ? data.restauranteId : null,
      sucursalIds: (data.sucursalIds as Record<number, number>) ?? {},
      horariosBySucursal: (data.horariosBySucursal as Record<number, number[]>) ?? {},
      mesasBySucursal: (data.mesasBySucursal as Record<number, number[]>) ?? {},
    },
    restaurant: data.restaurant as RestaurantData | undefined,
    venues: data.venues as Venue[] | undefined,
    pasoActual: 0,
  }
}

export function useOnboardingSync() {
  const loadProgress = useCallback(async () => {
    try {
      const status = await setupApi.getOnboardingStatus()
      if (status.completado) return null
      if (status.pasoActual <= 1 && Object.keys(status.datos).length === 0) return null
      return status
    } catch {
      return null
    }
  }, [])

  const saveProgress = useCallback(async (
    pasoActual: number,
    ids: PersistedIds,
    restaurant: RestaurantData,
    venues: Venue[],
  ) => {
    try {
      const datos: OnboardingProgressData = {
        restauranteId: ids.restauranteId ?? undefined,
        sucursalIds: ids.sucursalIds,
        horariosBySucursal: ids.horariosBySucursal,
        mesasBySucursal: ids.mesasBySucursal,
        restaurant,
        venues,
      }
      await setupApi.saveOnboardingProgress({
        pasoActual,
        datos: datos as Record<string, unknown>,
      })
    } catch {
      // silencioso — best-effort
    }
  }, [])

  return { loadProgress, saveProgress }
}
