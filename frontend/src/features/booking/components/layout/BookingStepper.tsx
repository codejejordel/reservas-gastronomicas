import { useBooking } from '../../state/BookingContext'

const STEPS = [
  { num: 0, label: 'Sucursal' },
  { num: 1, label: 'Fecha' },
  { num: 2, label: 'Hora' },
  { num: 3, label: 'Datos' },
  { num: 4, label: 'Pago' },
] as const

export function BookingStepper() {
  const { currentStep } = useBooking()

  const mobileSteps = ['Fecha y personas', 'Horario', 'Tus datos', 'Revisar y pagar']

  return (
    <>
      {currentStep === 0 ? (
      <div className="mb-5 lg:hidden" aria-label="Selección de sucursal">
        <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Antes de reservar</p>
        <p className="mt-1 text-sm font-semibold text-on-surface" aria-current="step">Elegí sucursal</p>
      </div>
      ) : (
      <div className="mb-5 lg:hidden" aria-label={`Paso ${currentStep} de 4: ${mobileSteps[currentStep - 1]}`}>
        <div className="mb-2 flex items-center justify-between gap-4 text-xs">
          <p className="font-bold uppercase tracking-wider text-on-surface" aria-current="step">
            Paso {currentStep} de 4
          </p>
          <p className="truncate text-on-surface-variant">{mobileSteps[currentStep - 1]}</p>
        </div>
        <div
          role="progressbar"
          aria-label="Progreso de la reserva"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={currentStep}
          className="h-1 overflow-hidden rounded-full bg-surface-container-high"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${currentStep * 25}%` }}
          />
        </div>
      </div>
      )}

      <div className="hidden items-center justify-start gap-2 mb-8 lg:flex" aria-label="Progreso de la reserva">
        {STEPS.map((step, idx) => {
          const isActive = currentStep === step.num
          const isCompleted = currentStep > step.num
          const isLast = idx === STEPS.length - 1

          return (
            <div key={step.num} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={
                    isActive
                      ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', transform: 'scale(1.1)' }
                      : isCompleted
                        ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', opacity: 0.7 }
                        : { backgroundColor: 'var(--color-surface-container)', color: 'var(--color-on-surface-variant)' }
                  }
                >
                  {isCompleted ? '✓' : step.num}
                </div>
                <span
                  className="text-sm font-semibold transition-colors"
                  style={{ color: isActive ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)' }}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className="w-8 h-0.5 mx-2 transition-colors"
                  style={{ backgroundColor: isCompleted ? 'var(--color-primary)' : 'var(--color-outline-variant)' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
