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
    <div className="space-y-5 lg:space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.4rem' }}>
          <span className="lg:hidden">¿A nombre de quién reservamos?</span>
          <span className="hidden lg:inline">Tus datos</span>
        </h2>
        <p className="text-sm text-on-surface-variant lg:hidden">
          Necesitamos estos datos para confirmar tu reserva.
        </p>
        <p className="hidden text-sm text-on-surface-variant lg:block">
          Completá tus datos para continuar con el pago.
        </p>
      </div>

      <LoginPromptBanner />

      <div className="rounded-2xl bg-white px-0 py-1 lg:border lg:border-outline-variant lg:p-5">
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
