import { CreditCard, Landmark } from 'lucide-react'

interface PaymentMethodSelectorProps {
  value: 'MP' | 'TRANSFERENCIA' | null
  onChange: (v: 'MP' | 'TRANSFERENCIA') => void
}

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => onChange('MP')}
        className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
          value === 'MP'
            ? 'border-primary bg-primary-container/30'
            : 'border-outline-variant bg-white hover:border-outline hover:bg-surface-container-lowest'
        }`}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${value === 'MP' ? 'bg-primary' : 'bg-surface-container'}`}>
          <CreditCard size={18} className={value === 'MP' ? 'text-on-primary' : 'text-on-surface-variant'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface">Tarjeta de Crédito / Débito</p>
          <p className="text-xs text-on-surface-variant">Procesado por MercadoPago</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          value === 'MP' ? 'border-primary bg-primary' : 'border-outline-variant'
        }`}>
          {value === 'MP' && <div className="w-2 h-2 rounded-full bg-on-primary" />}
        </div>
      </button>

      <button
        type="button"
        disabled
        className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl border-2 border-outline-variant bg-surface-container-lowest opacity-50 cursor-not-allowed text-left"
      >
        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
          <Landmark size={18} className="text-on-surface-variant" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-on-surface">Transferencia Bancaria</p>
            <span className="text-[0.6rem] font-bold uppercase tracking-wide bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded">
              Próximamente
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">CBU / Alias</p>
        </div>
        <div className="w-5 h-5 rounded-full border-2 border-outline-variant shrink-0" />
      </button>
    </div>
  )
}
