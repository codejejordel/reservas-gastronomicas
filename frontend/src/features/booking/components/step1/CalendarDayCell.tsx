import { motion } from 'motion/react'
import type { DayAvailabilityStatus } from '../../types/bookingTypes'

interface CalendarDayCellProps {
  day: number
  date: string
  status: DayAvailabilityStatus
  isSelected: boolean
  isToday: boolean
  onClick: () => void
}

export function CalendarDayCell({ day, status, isSelected, isToday, onClick }: CalendarDayCellProps) {
  const isDisabled = status === 'past' || status === 'full' || status === 'closed'

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
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      className={`
        relative w-full aspect-square rounded-lg text-sm font-semibold
        flex flex-col items-center justify-center
        transition-all disabled:cursor-not-allowed
        ${getStatusColor()}
        ${isToday && !isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
      `}
    >
      {day}
      {getIndicator()}
    </motion.button>
  )
}
