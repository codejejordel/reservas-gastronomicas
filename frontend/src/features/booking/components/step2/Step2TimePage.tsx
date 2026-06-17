import { useMemo } from 'react'
import { useBooking } from '../../state/BookingContext'
import { TimeSlotGrid } from './TimeSlotGrid'
import { useDisponibilidad } from '../../hooks/useDisponibilidad'
import { ButtonStepers } from '../shared/ButtonStepers'
import { toIsoDate } from '../../lib/dateUtils'

export function Step2TimePage() {
  const { sucursal, fecha, partySize, hora, setHora, nextStep, prevStep } = useBooking()

  // Calcular rango de 7 días desde la fecha seleccionada para tener cache
  const desde = fecha || toIsoDate(new Date())
  const hasta = useMemo(() => {
    const d = new Date(desde)
    d.setDate(d.getDate() + 6)
    return toIsoDate(d)
  }, [desde])

  const { data: disponibilidad, isFetching } = useDisponibilidad({
    sucursalId: sucursal?.id,
    desde,
    hasta,
    personas: partySize,
  })

  const slots = useMemo(() => {
    if (!fecha || !disponibilidad?.horarios?.[fecha]) return []
    return disponibilidad.horarios[fecha].map(h => ({
      time: h.hora,
      available: h.disponible,
    }))
  }, [disponibilidad, fecha])

  const canContinue = hora !== null

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.4rem' }}>
          Elegí tu horario
        </h2>
        <p className="text-sm text-on-surface-variant">
          Seleccioná el horario que mejor te convenga.
        </p>
      </div>

      {/* Indicador de actualización */}
      {isFetching && (
        <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Actualizando horarios...
        </div>
      )}

      {/* Grid de horarios */}
      <div className="bg-white rounded-2xl border border-outline-variant p-5">
        <TimeSlotGrid
          slots={slots}
          selectedTime={hora}
          onSelectTime={setHora}
        />
      </div>

      <ButtonStepers
        onBack={prevStep}
        onNext={nextStep}
        nextDisabled={!canContinue}
      />
    </div>
  )
}
