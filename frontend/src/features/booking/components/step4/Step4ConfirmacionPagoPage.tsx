import { MapPin, Store } from 'lucide-react'
import { useBooking } from '../../state/BookingContext'
import { AddressMap } from '../shared/AddressMap'
import { PriceBreakdown } from './PriceBreakdown'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { ButtonStepers } from '../shared/ButtonStepers'
import { formatARS } from '../../utils/pricing'

interface Step4ConfirmacionPagoPageProps {
  canSubmit: boolean
  handleSubmit: () => Promise<void>
  submitting: boolean
}

export function Step4ConfirmacionPagoPage({ canSubmit, handleSubmit, submitting }: Step4ConfirmacionPagoPageProps) {
  const {
    restaurante,
    sucursal,
    metodoPago,
    setMetodoPago,
    acceptedTerms,
    setAcceptedTerms,
    prevStep,
    cotizacion,
    cotizacionLoading,
    cotizacionError,
    retryCotizacion,
    error,
  } = useBooking()

  const direccionCompleta = sucursal ? `${sucursal.direccion}, ${sucursal.ciudad}` : ''

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Header */}
      <div>
        {sucursal && (
          <div
           className="hidden items-center gap-1.5 text-xs font-semibold text-primary px-3 py-1 rounded-full mb-3 shadow-sm lg:inline-flex lg:bg-primary-container lg:shadow-none"
           >
            <Store size={12} />
            <span>Estás reservando en: <span style={{ color: restaurante?.colorPrimario || '#667eea' }}>{restaurante?.nombrePublico}</span></span>
          </div>
        )}
        <h2
          style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.4rem' }}
        >
          <span className="lg:hidden">Revisá tu reserva</span>
          <span className="hidden lg:inline">Resumen y Pago de Reserva</span>
        </h2>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-error/30 bg-error-container p-4 text-sm text-on-error-container">
          {error}
        </div>
      )}

      {/* Ubicación */}
      {sucursal && (
        <div className="rounded-2xl bg-white p-4 lg:border lg:border-outline-variant lg:p-5">
          <h3 className="text-base font-bold text-on-surface mb-3 lg:text-sm">Ubicación</h3>
          <p className="text-sm font-semibold text-on-surface mb-1">{sucursal.nombre}</p>
          <div className="flex items-start gap-1.5 mb-3">
            <MapPin size={14} className="text-on-surface-variant shrink-0 mt-0.5" />
            <p className="text-sm text-on-surface-variant">{sucursal.direccion}, {sucursal.ciudad}</p>
          </div>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(direccionCompleta)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline hover:no-underline lg:mb-3 lg:min-h-0 lg:inline-block lg:text-xs"
          >
            <span className="lg:hidden">Cómo llegar</span>
            <span className="hidden lg:inline">Ver en Google Maps</span>
          </a>
          <AddressMap direccion={direccionCompleta} className="hidden mt-2 lg:block" />
        </div>
      )}

      {/* Resumen de pago */}
      <div className="rounded-2xl bg-white p-4 lg:border lg:border-outline-variant lg:p-5">
        <h3 className="text-base font-bold text-on-surface mb-4 lg:text-sm">Resumen de Pago</h3>
        {cotizacionLoading && (
          <div className="space-y-3" role="status" aria-live="polite" aria-label="Calculando total">
            <div className="h-5 rounded-lg bg-surface-container animate-pulse" />
            <div className="h-5 rounded-lg bg-surface-container animate-pulse" />
            <div className="h-10 rounded-lg bg-surface-container animate-pulse" />
          </div>
        )}
        {cotizacionError && (
          <div className="rounded-xl border border-error/30 bg-error-container p-4 text-sm text-on-error-container">
            <p>{cotizacionError}</p>
            <button
              type="button"
              onClick={retryCotizacion}
              className="mt-3 min-h-11 rounded-lg bg-error px-3 py-2 text-sm font-bold text-on-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2"
            >
              Reintentar
            </button>
          </div>
        )}
        {cotizacion && <PriceBreakdown cotizacion={cotizacion} />}
      </div>

      {cotizacion && (
        <div className="rounded-2xl bg-white p-4 lg:bg-surface-container-lowest lg:border lg:border-outline-variant lg:p-5">
          <h3 className="text-base font-bold text-on-surface mb-3 lg:text-sm">Políticas de la reserva</h3>
          <div className="space-y-2 text-sm text-on-surface-variant leading-relaxed lg:text-xs">
            {cotizacion.cobraSenia && cotizacion.montoSenia > 0 && (
              <p>Se requiere una seña de {formatARS(cotizacion.montoSenia)} para confirmar la reserva.</p>
            )}
            <p>Podés cancelar sin cargo hasta {cotizacion.horasCancelacionLibre} horas antes del horario reservado.</p>
            <p>La tolerancia de llegada es de {cotizacion.toleranciaMinutos} minutos; después de ese plazo la mesa podría ser liberada.</p>
          </div>
        </div>
      )}

      {/* Método de pago */}
      <div className="rounded-2xl bg-white p-4 lg:border lg:border-outline-variant lg:p-5">
        <h3 className="text-base font-bold text-on-surface mb-4 lg:text-sm">Método de Pago</h3>
        <PaymentMethodSelector value={metodoPago} onChange={setMetodoPago} />
      </div>

      {/* Términos */}
      <div className="bg-surface-container-lowest rounded-lg p-4">
        <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg focus-within:ring-2 focus-within:ring-primary lg:min-h-0">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={e => setAcceptedTerms(e.target.checked)}
            className="w-5 h-5 mt-0.5 text-primary shrink-0 lg:w-4 lg:h-4"
          />
          <span className="text-sm text-on-surface leading-relaxed lg:text-xs">
            Acepto los{' '}
            <a href="/terminos" target="_blank" className="text-primary underline hover:no-underline">términos y condiciones</a>
            {' '}y la{' '}
            <a href="/privacidad" target="_blank" className="text-primary underline hover:no-underline">política de privacidad</a>.
          </span>
        </label>
      </div>

      <ButtonStepers
        onBack={prevStep}
        onNext={handleSubmit}
        nextDisabled={!canSubmit || !cotizacion}
        nextLabel="Finalizar reserva"
        loading={submitting}
      />
    </div>
  )
}
