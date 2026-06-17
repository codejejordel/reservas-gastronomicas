import { useBooking } from '../../state/BookingContext'
import { PartySizeCounter } from './PartySizeCounter'
import { DualMonthCalendar } from './DualMonthCalendar'
import { ButtonStepers } from '../shared/ButtonStepers'

export function Step1DatePage() {
  const { sucursal, partySize, setPartySize, fecha, setFecha, nextStep } = useBooking()

  const canContinue = fecha !== null

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.4rem' }}>
          Seleccioná tu mesa
        </h2>
        <p className="text-sm text-on-surface-variant">
          Indicá el número de personas y la fecha preferida para tu visita.
        </p>
      </div>

      {/* Configuración */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-4">
          Configuración
        </p>
        <div className="flex flex-col items-center gap-4">
          <div>
            <p className="text-sm font-semibold text-on-surface mb-2 text-center">Número de comensales</p>
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
