import { Info } from 'lucide-react'
import type { CotizacionReserva } from '../../services/bookingApi'
import { formatARS } from '../../utils/pricing'

interface PriceBreakdownProps {
  cotizacion: CotizacionReserva
}

export function PriceBreakdown({ cotizacion }: PriceBreakdownProps) {
  const muestraSenia = cotizacion.cobraSenia && cotizacion.montoSenia > 0

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4 text-sm lg:items-center">
        <span className="min-w-0 text-on-surface-variant">Cargo por servicio por persona</span>
        <span className="shrink-0 text-on-surface font-medium">
          {formatARS(cotizacion.cargoServicioUnitario)}
        </span>
      </div>

      <div className="flex items-start justify-between gap-4 text-sm lg:items-center">
        <span className="text-on-surface-variant">Cargo por servicio total</span>
        <span className="shrink-0 text-on-surface font-medium">{formatARS(cotizacion.cargoServicioTotal)}</span>
      </div>

      {muestraSenia && (
        <div className="flex items-start justify-between gap-4 text-sm lg:items-center">
          <span className="text-on-surface-variant">Seña del restaurante</span>
          <span className="shrink-0 text-on-surface font-medium">{formatARS(cotizacion.montoSenia)}</span>
        </div>
      )}

      <div className="border-t border-outline-variant pt-3 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-on-surface">Total a pagar ahora</span>
        <span className="shrink-0 text-xl font-bold text-primary">{formatARS(cotizacion.totalAPagarAhora)}</span>
      </div>

      <div className="flex items-start gap-2 bg-surface-container-lowest rounded-lg px-3 py-2.5">
        <Info size={14} className="text-on-surface-variant shrink-0 mt-0.5" />
        <p className="text-xs text-on-surface-variant leading-relaxed">
          {muestraSenia
            ? 'Este monto asegura tu mesa y será descontado del ticket final de tu consumo en el restaurante.'
            : 'El cargo por servicio Turnify asegura tu reserva. No incluye consumo en el restaurante.'}
        </p>
      </div>
    </div>
  )
}
