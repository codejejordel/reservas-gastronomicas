import { useBooking } from '../../state/BookingContext'
import { PartySizeCounter } from './PartySizeCounter'
import { DualMonthCalendar } from './DualMonthCalendar'
import { ButtonStepers } from '../shared/ButtonStepers'

export function Step1DatePage() {
  const { sucursal, partySize, setPartySize, fecha, setFecha, nextStep } = useBooking()

  const canContinue = fecha !== null

  return (
    <div className="space-y-5 lg:space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.4rem' }}>
          <span className="lg:hidden">¿Cuándo vienen?</span>
          <span className="hidden lg:inline">Seleccioná tu mesa</span>
        </h2>
        <p className="text-sm text-on-surface-variant lg:hidden">
          Elegí la cantidad de personas y una fecha disponible.
        </p>
        <p className="hidden text-sm text-on-surface-variant lg:block">
          Indicá el número de personas y la fecha preferida para tu visita.
        </p>
      </div>

      {/* Configuración */}
      <div className="rounded-2xl bg-white p-4 lg:bg-surface-container-lowest lg:border lg:border-outline-variant lg:p-5">
        <p className="mb-4 text-sm font-bold text-on-surface-variant lg:text-xs lg:uppercase lg:tracking-wide">
          Configuración
        </p>
        <div className="flex flex-col items-center gap-4">
          <div>
            <p className="text-base font-semibold text-on-surface mb-2 text-center lg:text-sm">Número de comensales</p>
            <PartySizeCounter value={partySize} onChange={setPartySize} />
          </div>
        </div>
      </div>

      {/* Calendario */}
      <DualMonthCalendar
        sucursalId={sucursal?.id || 1}
        partySize={partySize}
        selectedDate={fecha}
        onSelectDate={setFecha}
      />

      <ButtonStepers
        onNext={nextStep}
        nextDisabled={!canContinue}
        showBack={false}
      />
    </div>
  )
}
