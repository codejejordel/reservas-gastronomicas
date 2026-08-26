import { Calendar, ChevronDown, Clock, MapPin, Users } from 'lucide-react'
import { useBooking } from '../../state/BookingContext'

function formatFecha(fecha: string | null) {
  if (!fecha) return null

  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${fecha}T00:00:00`))
}

export function MobileBookingSummary() {
  const { currentStep, sucursal, partySize, fecha, hora, goToStep } = useBooking()

  if (currentStep === 0) return null

  const fechaFormateada = formatFecha(fecha)

  return (
    <details className="group mb-5 overflow-hidden rounded-xl border border-outline-variant/70 bg-white lg:hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm text-on-surface marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset">
        <Calendar size={16} className="shrink-0 text-primary" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate font-medium">
          {[fechaFormateada, hora, `${partySize} ${partySize === 1 ? 'persona' : 'personas'}`]
            .filter(Boolean)
            .join(' · ')}
        </span>
        <span className="sr-only">Mostrar resumen de la reserva</span>
        <ChevronDown
          size={18}
          className="shrink-0 text-on-surface-variant transition-transform group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>

      <div className="grid gap-3 border-t border-outline-variant/70 px-3 py-3 text-sm">
        {sucursal && (
          <div className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-on-surface">{sucursal.nombre}</p>
              <p className="truncate text-xs text-on-surface-variant">{sucursal.direccion}, {sucursal.ciudad}</p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 text-xs text-on-surface-variant">
          <div className="flex min-w-0 items-center gap-1.5">
            <Calendar size={15} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{fechaFormateada ?? 'Sin fecha'}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Clock size={15} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{hora ?? 'Sin horario'}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Users size={15} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{partySize} pers.</span>
          </div>
        </div>
        {currentStep === 4 && (
          <div className="flex gap-2 border-t border-outline-variant/70 pt-3">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="min-h-11 flex-1 rounded-lg border border-outline-variant px-3 text-xs font-semibold text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Editar fecha
            </button>
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="min-h-11 flex-1 rounded-lg border border-outline-variant px-3 text-xs font-semibold text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Editar horario
            </button>
          </div>
        )}
      </div>
    </details>
  )
}
