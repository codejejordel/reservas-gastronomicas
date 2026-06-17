import type { LucideIcon } from 'lucide-react'

interface BookingSummaryRowProps {
  icon: LucideIcon
  label: string
  value: string | null
}

export function BookingSummaryRow({ icon: Icon, label, value }: BookingSummaryRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
        <Icon size={18} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[0.65rem] font-bold uppercase tracking-wide text-on-surface-variant mb-0.5">
          {label}
        </p>
        <p className={`text-sm font-semibold ${value ? 'text-on-surface' : 'text-on-surface-variant italic'}`}>
          {value || 'Pendiente'}
        </p>
      </div>
    </div>
  )
}
