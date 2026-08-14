import { AnimatePresence, motion } from 'motion/react'
import { Plus, Copy, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { DaySchedule, DayKey } from '@/features/setup/state/setupTypes'
import { DAY_KEYS, DAY_LABELS } from '@/features/setup/state/setupTypes'
import { Switch } from '@/shared/ui/switch'
import { TimeRangeInput } from './TimeRangeInput'

interface CopyMenuProps {
  fromDay: DayKey
  onCopy: (toDays: DayKey[]) => void
  onCopied: () => void
  onClose: () => void
}

function CopyMenu({ fromDay, onCopy, onCopied, onClose }: CopyMenuProps) {
  const weekdays: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri']
  const weekend: DayKey[] = ['sat', 'sun']
  const others = DAY_KEYS.filter(d => d !== fromDay)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        position: 'absolute', top: '100%', right: 0, zIndex: 50, marginTop: 4,
        background: 'white', borderRadius: '0.75rem', minWidth: 200,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid var(--color-outline-variant)',
        overflow: 'hidden',
      }}
    >
      {[
        { label: 'Lunes a viernes', days: weekdays.filter(d => d !== fromDay) },
        { label: 'Sábado y domingo', days: weekend.filter(d => d !== fromDay) },
        { label: 'Todos los días', days: others },
      ].map(({ label, days }) => days.length > 0 && (
        <button key={label} type="button"
          onClick={() => { onCopy(days); onCopied(); onClose() }}
          className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors"
        >
          {label}
        </button>
      ))}
      <div className="border-t border-outline-variant" />
      {DAY_KEYS.filter(d => d !== fromDay).map(d => (
        <button key={d} type="button"
          onClick={() => { onCopy([d]); onCopied(); onClose() }}
          className="w-full text-left px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          Solo {DAY_LABELS[d]}
        </button>
      ))}
    </motion.div>
  )
}

interface DayScheduleRowProps {
  day: DayKey
  schedule: DaySchedule
  rangeErrors: Record<number, string>
  onToggle: (enabled: boolean) => void
  onTimeChange: (rangeId: number, field: 'open' | 'close', value: string) => void
  onAddRange: () => void
  onRemoveRange: (rangeId: number) => void
  onCopy: (toDays: DayKey[]) => void
}

export function DayScheduleRow({ day, schedule, rangeErrors, onToggle, onTimeChange, onAddRange, onRemoveRange, onCopy }: DayScheduleRowProps) {
  const [copyOpen, setCopyOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const canAddRange = schedule.ranges.length < 3

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(t)
  }, [copied])

  return (
    <div ref={containerRef} className="py-3 border-b border-outline-variant last:border-0">
      {/*
        Grid: [switch+name] [ranges] [copy]
        col1 = auto (switch 44px + gap + name 88px)
        col2 = 1fr
        col3 = auto (copy button)
      */}
      {/* Mobile: flex-col. sm+: single row grid */}
      <div className="flex flex-col gap-2 sm:grid sm:items-start sm:gap-x-3"
        style={{ gridTemplateColumns: '1fr auto' }}
      >
        {/* Row 1 on mobile / Col 1 on desktop: Switch + name + copy (mobile only) */}
        <div className="flex items-center gap-2 self-start pt-0.5 w-full">
          <Switch
            checked={schedule.enabled}
            onCheckedChange={onToggle}
            className="shrink-0"
          />
          <span className={`text-sm font-semibold transition-colors ${schedule.enabled ? 'text-on-surface' : 'text-on-surface-variant'}`}>
            {DAY_LABELS[day]}
          </span>
          {/* Copy button — visible on mobile in name row, hidden on sm+ (handled via rightAction) */}
          <div className="relative ml-auto sm:hidden">
            <button
              type="button"
              onClick={() => setCopyOpen(v => !v)}
              className={`p-1 rounded-md transition-colors ${copied ? 'text-success bg-success/10' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'}`}
              title={copied ? '¡Copiado!' : 'Copiar a otros días'}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            <AnimatePresence>
              {copyOpen && (
                <CopyMenu fromDay={day} onCopy={onCopy} onCopied={() => setCopied(true)} onClose={() => setCopyOpen(false)} />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Row 2 on mobile / Col 2 on desktop: ranges stacked */}
        <div className="flex flex-col gap-2 pl-9 sm:pl-0 relative">
          <AnimatePresence mode="wait" initial={false}>
            {schedule.enabled ? (
              <motion.div
                key="open"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-2"
              >
                {/* All ranges — first gets copy button, rest get delete */}
                {schedule.ranges.map((range, idx) => (
                  <TimeRangeInput
                    key={range.id}
                    range={range}
                    canDelete={idx > 0}
                    error={rangeErrors[range.id]}
                    onChange={(field, value) => onTimeChange(range.id, field, value)}
                    onDelete={() => onRemoveRange(range.id)}
                    rightAction={idx === 0 ? (
                      <div className="relative hidden sm:flex">
                        <button
                          type="button"
                          onClick={() => setCopyOpen(v => !v)}
                          className={`p-1 rounded-md transition-colors ${copied ? 'text-success bg-success/10' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'}`}
                          title={copied ? '¡Copiado!' : 'Copiar a otros días'}
                        >
                          {copied ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                        <AnimatePresence>
                          {copyOpen && (
                            <CopyMenu fromDay={day} onCopy={onCopy} onCopied={() => setCopied(true)} onClose={() => setCopyOpen(false)} />
                          )}
                        </AnimatePresence>
                      </div>
                    ) : undefined}
                  />
                ))}
                {/* Add range button */}
                {canAddRange && (
                  <button
                    type="button"
                    onClick={onAddRange}
                    className="flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:text-primary/70 transition-colors w-fit"
                  >
                    <Plus size={11} strokeWidth={2.5} /> Agregar turno
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.span
                key="closed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="inline-flex text-xs font-medium text-on-surface-variant bg-surface-container px-2.5 py-0.5 rounded-full self-start mt-1"
              >
                Cerrado
              </motion.span>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
