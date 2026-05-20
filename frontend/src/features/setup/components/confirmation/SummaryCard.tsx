import { Pencil } from 'lucide-react'

interface SummaryCardProps {
  title: string
  icon: React.ReactNode
  onEdit: () => void
  children: React.ReactNode
}

export function SummaryCard({ title, icon, onEdit, children }: SummaryCardProps) {
  return (
    <div className="border border-outline-variant rounded-2xl bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface-container-lowest">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <span className="text-sm font-bold text-on-surface">{title}</span>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <Pencil size={11} /> Editar
        </button>
      </div>
      <div className="px-4 py-3 text-sm text-on-surface-variant">
        {children}
      </div>
    </div>
  )
}
