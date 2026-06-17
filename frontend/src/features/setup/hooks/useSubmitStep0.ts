import { useSetupWizard } from '@/features/setup/state/SetupWizardContext'
import { useCurrentUser } from '@/features/auth/store/authStore'
import { useCreateRestaurante } from './useCreateRestaurante'
import { useUpdateRestaurante } from './useUpdateRestaurante'
import { mapRestaurantToCreateDto, mapRestaurantToUpdateDto } from '@/features/setup/services/setupMappers'

export function useSubmitStep0() {
  const { restaurant, ids, setRestauranteId, nextStep } = useSetupWizard()
  const user = useCurrentUser()

  const createMutation = useCreateRestaurante()
  const updateMutation = useUpdateRestaurante()

  const isPending = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error || updateMutation.error

  const submit = async () => {
    if (ids.restauranteId) {
      const dto = mapRestaurantToUpdateDto(restaurant)
      await updateMutation.mutateAsync({ id: ids.restauranteId, dto })
      nextStep()
    } else {
      if (!user) throw new Error('Usuario no autenticado')
      const dto = mapRestaurantToCreateDto(restaurant, user.id)
      const response = await createMutation.mutateAsync(dto)
      setRestauranteId(response.id)
      nextStep()
    }
  }

  return { submit, isPending, error }
}
