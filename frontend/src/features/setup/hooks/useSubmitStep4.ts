import { useSetupWizard } from '@/features/setup/state/SetupWizardContext'
import { useUpdateRestaurante } from './useUpdateRestaurante'
import { mapBrandToUpdateDto } from '@/features/setup/services/setupMappers'
import { useAuthStore } from '@/features/auth/store/authStore'
import { apiFetch } from '@/shared/api/apiClient'

export function useSubmitStep4() {
  const { brand, ids, nextStep } = useSetupWizard()
  const updateMutation = useUpdateRestaurante()
  const { user, setAuth, token } = useAuthStore()

  const isPending = updateMutation.isPending
  const error = updateMutation.error

  const submit = async () => {
    if (!ids.restauranteId) {
      nextStep()
      return
    }

    const dto = mapBrandToUpdateDto(brand)
    await updateMutation.mutateAsync({ id: ids.restauranteId, dto })

    if (user) {
      await apiFetch(`/api/usuario/${user.id}/onboarding`, { method: 'PATCH' })
      setAuth(token!, { ...user, onboardingCompleto: true })
    }

    nextStep()
  }

  return { submit, isPending, error }
}
