import { MapPin, Store } from 'lucide-react'
import { useBooking } from '../../state/BookingContext'
import { useStep4Submit } from '../../hooks/useStep4Submit'
import { AddressMap } from '../shared/AddressMap'
import { PriceBreakdown } from './PriceBreakdown'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { ButtonStepers } from '../shared/ButtonStepers'

export function Step4ConfirmacionPagoPage() {
  const { restaurante, sucursal, partySize, metodoPago, setMetodoPago, acceptedTerms, setAcceptedTerms, prevStep } = useBooking()
  const { canSubmit, handleSubmit, submitting } = useStep4Submit()

  const direccionCompleta = sucursal ? `${sucursal.direccion}, ${sucursal.ciudad}` : ''

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        {sucursal && (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary-container px-3 py-1 rounded-full mb-3">
            <Store size={12} />
            <span>Estás reservando en: {restaurante?.nombrePublico}</span>
          </div>
        )}
        <h2
          style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.4rem' }}
        >
          Resumen y Pago de Reserva
        </h2>
      </div>

      {/* Ubicación */}
      {sucursal && (
        <div className="bg-white rounded-2xl border border-outline-variant p-5">
          <h3 className="text-sm font-bold text-on-surface mb-3">Ubicación</h3>
          <p className="text-sm font-semibold text-on-surface mb-1">{sucursal.nombre}</p>
          <div className="flex items-start gap-1.5 mb-3">
            <MapPin size={14} className="text-on-surface-variant shrink-0 mt-0.5" />
            <p className="text-sm text-on-surface-variant">{sucursal.direccion}, {sucursal.ciudad}</p>
          </div>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(direccionCompleta)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-primary underline hover:no-underline mb-3 inline-block"
          >
            Ver en Google Maps
          </a>
          <AddressMap direccion={direccionCompleta} className="mt-2" />
        </div>
      )}

      {/* Resumen de pago */}
      <div className="bg-white rounded-2xl border border-outline-variant p-5">
        <h3 className="text-sm font-bold text-on-surface mb-4">Resumen de Pago</h3>
        <PriceBreakdown partySize={partySize} />
      </div>

      {/* Método de pago */}
      <div className="bg-white rounded-2xl border border-outline-variant p-5">
        <h3 className="text-sm font-bold text-on-surface mb-4">Método de Pago</h3>
        <PaymentMethodSelector value={metodoPago} onChange={setMetodoPago} />
      </div>

      {/* Términos */}
      <div className="bg-surface-container-lowest rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={e => setAcceptedTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-primary shrink-0"
          />
          <span className="text-xs text-on-surface leading-relaxed">
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
        nextDisabled={!canSubmit}
        nextLabel="Finalizar reserva"
        loading={submitting}
      />
    </div>
  )
}
