import { motion, useReducedMotion } from 'motion/react'
import type { DayAvailabilityStatus } from '../../types/bookingTypes'

interface CalendarDayCellProps {
  day: number
  date: string
  status: DayAvailabilityStatus
  isSelected: boolean
  isToday: boolean
  onClick: () => void
}

export function CalendarDayCell({ day, date, status, isSelected, isToday, onClick }: CalendarDayCellProps) {
  const isDisabled = status === 'past' || status === 'full' || status === 'closed'
  const reduceMotion = useReducedMotion()
  const accessibleDate = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${date}T00:00:00`))

  const getStatusColor = () => {
    if (isSelected) return 'bg-primary text-on-primary'
    if (status === 'past') return 'bg-transparent text-on-surface-variant/30'
    if (status === 'closed') return 'bg-surface-container-low text-on-surface-variant/60'
    if (status === 'full') return 'bg-error-container/30 text-on-surface-variant line-through'
    if (status === 'few-left') return 'bg-error-container text-on-error-container'
    return 'bg-transparent text-on-surface hover:bg-surface-container'
  }

  const getIndicator = () => {
    if (isSelected) return null
    if (status === 'available') return <div className="w-1.5 h-1.5 rounded-full bg-primary absolute bottom-1" />
    if (status === 'few-left') return <div className="w-1.5 h-1.5 rounded-full bg-error absolute bottom-1" />
    if (status === 'closed') return <span className="text-[10px] absolute bottom-0.5 text-on-surface-variant/50">—</span>
    return null
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={`${accessibleDate}${status === 'few-left' ? ', últimas mesas' : ''}${isDisabled ? ', no disponible' : ''}`}
      aria-pressed={isSelected}
      aria-current={isToday ? 'date' : undefined}
      whileHover={!reduceMotion && !isDisabled ? { scale: 1.05 } : {}}
      whileTap={!reduceMotion && !isDisabled ? { scale: 0.95 } : {}}
      className={`
        relative min-h-11 min-w-11 w-full lg:aspect-square lg:min-h-0 lg:min-w-0 rounded-lg text-sm font-semibold
        flex flex-col items-center justify-center
        transition-all motion-reduce:transition-none disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset
        ${getStatusColor()}
        ${isToday && !isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
      `}
    >
      {day}
      {getIndicator()}
    </motion.button>
  )
}
