import { Users, Calendar, Clock, Info, Lock, Lightbulb } from 'lucide-react'
import { useBooking } from '../../state/BookingContext'
import { BookingSummaryRow } from '../shared/BookingSummaryRow'
import { formatARS, calcularTotal } from '../../utils/pricing'

interface BookingSidebarProps {
  onFinalizar?: () => void
  canFinalizar?: boolean
  submitting?: boolean
}

export function BookingSidebar({ onFinalizar, canFinalizar = false, submitting = false }: BookingSidebarProps) {
  const { restaurante, sucursal, partySize, fecha, hora, currentStep } = useBooking()
  const isStep4 = currentStep === 4
  const total = calcularTotal(partySize)

  const formatFecha = (f: string | null) => {
    if (!f) return null
    const d = new Date(f + 'T00:00:00')
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${dias[d.getDay()]}, ${d.getDate()} ${meses[d.getMonth()]}`
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant">
      {/* Header con foto */}
      {restaurante?.fotoLocalUrl && (
        <div className="w-full aspect-video bg-surface-container">
          <img
            src={restaurante.fotoLocalUrl}
            alt={restaurante.nombrePublico}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Título */}
      <div className="px-5 pt-4 pb-3 border-b border-outline-variant">
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
            style={{ background: restaurante?.colorPrimario || 'var(--color-primary)' }}
          >
            {restaurante?.nombrePublico.charAt(0).toUpperCase() || 'R'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-on-surface leading-tight">
              {restaurante?.nombrePublico || 'Restaurante'}
            </h3>
            {sucursal && (
              <p className="text-xs text-on-surface-variant mt-0.5">
                {sucursal.ciudad}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Resumen de reserva */}
      <div className="px-5 py-4">
        <p className="text-[0.7rem] font-bold uppercase tracking-wider text-on-surface-variant mb-4">
          Resumen de reserva
        </p>
        <div className="flex flex-col gap-3">
          <BookingSummaryRow
            icon={Users}
            label="Comensales"
            value={partySize > 0 ? `${partySize} ${partySize === 1 ? 'Adulto' : 'Adultos'}` : null}
          />
          <BookingSummaryRow
            icon={Calendar}
            label="Fecha"
            value={formatFecha(fecha)}
          />
          <BookingSummaryRow
            icon={Clock}
            label="Hora"
            value={hora}
          />
        </div>
      </div>

      {/* Alerta de tolerancia */}
      <div className="px-5 pb-5">
        <div className="flex items-start gap-2 bg-primary-container rounded-lg px-3 py-2.5">
          <Info size={14} className="text-primary shrink-0 mt-0.5" />
          <p className="text-[0.7rem] text-on-primary-container leading-relaxed">
            Las reservas tienen una tolerancia de 15 minutos. Pasado ese tiempo, la mesa podría ser liberada.
          </p>
        </div>
      </div>

      {/* Step 4: Botón finalizar + tip */}
      {isStep4 && (
        <>
          <div className="px-5 pb-5 border-t border-outline-variant pt-4">
            <button
              type="button"
              onClick={onFinalizar}
              disabled={!canFinalizar || submitting}
              aria-busy={submitting}
              className="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-px hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Finalizar reserva
                </>
              )}
            </button>
            <p className="text-center text-[0.65rem] text-on-surface-variant mt-2">
              Pago seguro procesado por Turnify Pay
            </p>
            <p className="text-center text-xs font-bold text-primary mt-1">{formatARS(total)}</p>
          </div>

          <div className="mx-5 mb-5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-2.5">
            <Lightbulb size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800 mb-0.5">Recomendación del Chef</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Llegá 10 minutos antes de tu horario. La tolerancia máxima de espera es de 15 minutos.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
