import { Info } from 'lucide-react'
import { CARGO_SERVICIO_POR_PERSONA, calcularTotal, formatARS } from '../../utils/pricing'

interface PriceBreakdownProps {
  partySize: number
  montoSenia?: number
}

export function PriceBreakdown({ partySize, montoSenia = 0 }: PriceBreakdownProps) {
  const total = calcularTotal(partySize, montoSenia)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-on-surface-variant">
          Cargo por servicio (x{partySize} {partySize === 1 ? 'adulto' : 'adultos'})
        </span>
        <span className="text-on-surface font-medium">
          {formatARS(CARGO_SERVICIO_POR_PERSONA)} c/u
        </span>
      </div>

      {montoSenia > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">Seña del restaurante</span>
          <span className="text-on-surface font-medium">{formatARS(montoSenia)}</span>
        </div>
      )}

      <div className="border-t border-outline-variant pt-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-on-surface">Total a pagar ahora</span>
        <span className="text-xl font-bold text-primary">{formatARS(total)}</span>
      </div>

      <div className="flex items-start gap-2 bg-surface-container-lowest rounded-lg px-3 py-2.5">
        <Info size={14} className="text-on-surface-variant shrink-0 mt-0.5" />
        <p className="text-xs text-on-surface-variant leading-relaxed">
          {montoSenia > 0
            ? 'Este monto asegura tu mesa y será descontado del ticket final de tu consumo en el restaurante.'
            : 'El cargo por servicio Turnify asegura tu reserva. No incluye consumo en el restaurante.'}
        </p>
      </div>
    </div>
  )
}
