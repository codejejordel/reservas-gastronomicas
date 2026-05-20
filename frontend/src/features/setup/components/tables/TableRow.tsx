import { Trash2, Users } from 'lucide-react'
import type { Table } from '@/features/setup/state/setupTypes'

interface TableRowProps {
  table: Table
  onUpdate: (patch: Partial<Omit<Table, 'id'>>) => void
  onDelete: () => void
}

const inputClass = [
  'border border-outline-variant rounded-lg bg-white px-3 py-2',
  'text-sm text-on-surface font-medium outline-none',
  'focus:border-primary focus:shadow-[0_0_0_2px_rgba(7,169,169,0.15)] transition-all',
].join(' ')

export function TableRow({ table, onUpdate, onDelete }: TableRowProps) {
  return (
    <div className="flex items-center gap-2 py-2.5 border-b border-outline-variant last:border-0">
      {/* Name */}
      <input
        type="text"
        value={table.name}
        onChange={e => onUpdate({ name: e.target.value })}
        placeholder="Ej: Mesa 1"
        className={`${inputClass} flex-1 min-w-0`}
      />

      {/* Capacity */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Users size={13} className="text-on-surface-variant" />
        <input
          type="number"
          min={1}
          max={99}
          value={table.capacity}
          onChange={e => onUpdate({ capacity: Math.max(1, parseInt(e.target.value) || 1) })}
          className={`${inputClass} w-16 text-center`}
        />
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 text-on-surface-variant hover:text-error transition-colors p-1.5 rounded-md hover:bg-error-container/30"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
