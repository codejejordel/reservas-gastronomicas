import { useSetupWizard } from '@/features/setup/state/SetupWizardContext'
import { useUpdateRestaurante } from './useUpdateRestaurante'
import { mapBrandToUpdateDto } from '@/features/setup/services/setupMappers'
import { useAuthStore } from '@/features/auth/store/authStore'
import { apiFetch } from '@/shared/api/apiClient'

async function uploadImage(restauranteId: number, tipo: 'LOGO' | 'BANNER', dataUrl: string | null) {
  if (!dataUrl?.startsWith('data:image/')) return
  const blob = await fetch(dataUrl).then(response => response.blob())
  const body = new FormData()
  body.append('archivo', new File([blob], tipo === 'LOGO' ? 'logo.png' : 'banner.png', { type: blob.type }))
  await apiFetch(`/api/restaurante/${restauranteId}/imagen?tipo=${tipo}`, { method: 'POST', body })
}

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
    await Promise.all([
      uploadImage(ids.restauranteId, 'LOGO', brand.logoDataUrl),
      uploadImage(ids.restauranteId, 'BANNER', brand.bannerDataUrl),
    ])

    if (user) {
      await apiFetch(`/api/usuario/${user.id}/onboarding`, { method: 'PATCH' })
      setAuth(token!, { ...user, onboardingCompleto: true })
    }

    nextStep()
  }

  return { submit, isPending, error }
}
