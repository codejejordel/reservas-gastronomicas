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

  return (
    <div className="flex items-center justify-start gap-2 mb-8">
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
  )
}
