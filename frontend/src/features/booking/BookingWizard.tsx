import { useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { BookingProvider, useBooking } from './state/BookingContext'
import { useStep4Submit } from './hooks/useStep4Submit'
import { BookingLayout } from './components/layout/BookingLayout'
import { Step0SucursalPage } from './components/step0/Step0SucursalPage'
import { Step1DatePage } from './components/step1/Step1DatePage'
import { Step2TimePage } from './components/step2/Step2TimePage'
import { Step3CustomerDataPage } from './components/step3/Step3CustomerDataPage'
import { Step4ConfirmacionPagoPage } from './components/step4/Step4ConfirmacionPagoPage'
import { useRestaurantePublico } from './hooks/useRestaurantePublico'

function BookingWizardContent() {
  const { slug } = useParams({ from: '/r/$slug/reservar' })
  const { currentStep, setRestaurante } = useBooking()
  const { canSubmit, handleSubmit, submitting } = useStep4Submit()

  const { data: restaurante, isLoading, isError } = useRestaurantePublico(slug)

  useEffect(() => {
    if (restaurante) {
      setRestaurante(restaurante)
    }
  }, [restaurante, setRestaurante])

  if (isLoading) {
    return (
      <BookingLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </BookingLayout>
    )
  }

  if (isError) {
    return (
      <BookingLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-lg text-error mb-2">No existe el restaurante</p>
          <p className="text-sm text-on-surface-variant">Verificá la URL o contactá al restaurante</p>
        </div>
      </BookingLayout>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step0SucursalPage />
      case 1:
        return <Step1DatePage />
      case 2:
        return <Step2TimePage />
      case 3:
        return <Step3CustomerDataPage />
      case 4:
        return <Step4ConfirmacionPagoPage />
      default:
        return <Step0SucursalPage />
    }
  }

  return (
    <BookingLayout
      onFinalizar={currentStep === 4 ? handleSubmit : undefined}
      canFinalizar={currentStep === 4 ? canSubmit : undefined}
      submitting={currentStep === 4 ? submitting : undefined}
    >
      {renderStep()}
    </BookingLayout>
  )
}

export function BookingWizard() {
  return (
    <BookingProvider>
      <BookingWizardContent />
    </BookingProvider>
  )
}
