import { useBooking } from '../../state/BookingContext'
import { LoginPromptBanner } from './LoginPromptBanner'
import { CustomerDataForm } from './CustomerDataForm'
import { ButtonStepers } from '../shared/ButtonStepers'

export function Step3CustomerDataPage() {
  const { cliente, prevStep, nextStep } = useBooking()

  const canContinue =
    cliente.nombre.trim().length > 0 &&
    cliente.email.trim().length > 0 &&
    cliente.telefono.trim().length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.4rem' }}>
          Tus datos
        </h2>
        <p className="text-sm text-on-surface-variant">
          Completá tus datos para continuar con el pago.
        </p>
      </div>

      <LoginPromptBanner />

      <div className="bg-white rounded-2xl border border-outline-variant p-5">
        <CustomerDataForm />
      </div>

      <ButtonStepers
        onBack={prevStep}
        onNext={nextStep}
        nextDisabled={!canContinue}
        nextLabel="Continuar →"
      />
    </div>
  )
}
