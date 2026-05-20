import type React from 'react'
import { Trash2 } from 'lucide-react'
import type { TimeRange } from '@/features/setup/state/setupTypes'
import { TimePicker } from '@/shared/ui/TimePicker'

interface TimeRangeInputProps {
  range: TimeRange
  canDelete: boolean
  error?: string
  onChange: (field: 'open' | 'close', value: string) => void
  onDelete: () => void
  rightAction?: React.ReactNode
}

export function TimeRangeInput({ range, canDelete, error, onChange, onDelete, rightAction }: TimeRangeInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="relative flex items-center gap-1">
        {/* Mobile: delete absolutely to the left, aligned with switch (-36px = pl-9 offset) */}
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="sm:hidden absolute -left-8 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error transition-colors p-1 rounded-md hover:bg-error-container/30"
          >
            <Trash2 size={13} />
          </button>
        )}
        <TimePicker
          value={range.open}
          onChange={v => onChange('open', v)}
        />
        <span className="text-xs text-on-surface-variant font-semibold select-none">—</span>
        <TimePicker
          value={range.close}
          onChange={v => onChange('close', v)}
          hasError={!!error}
        />
        {/* Right action slot — sm+ only */}
        <div className="hidden sm:flex w-7 items-center justify-center shrink-0">
          {canDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-md hover:bg-error-container/30"
            >
              <Trash2 size={13} />
            </button>
          ) : (rightAction ?? null)}
        </div>
      </div>
      {error && (
        <p className="text-[11px] text-error">{error}</p>
      )}
    </div>
  )
}
