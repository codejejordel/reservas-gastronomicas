import { motion, useReducedMotion } from 'motion/react'
import { Check, Moon, Sun } from 'lucide-react'
import type { TimeSlot } from '../../types/bookingTypes'

interface TimeSlotGridProps {
  slots: TimeSlot[]
  selectedTime: string | null
  onSelectTime: (time: string) => void
}

export function TimeSlotGrid({ slots, selectedTime, onSelectTime }: TimeSlotGridProps) {
  const reduceMotion = useReducedMotion()
  const lunchSlots = slots.filter(s => {
    const hour = parseInt(s.time.split(':')[0])
    return hour >= 12 && hour < 17
  })

  const dinnerSlots = slots.filter(s => {
    const hour = parseInt(s.time.split(':')[0])
    return hour >= 17
  })

  const renderSlots = (slotList: TimeSlot[], title: string) => {
    if (slotList.length === 0) return null

    return (
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-on-surface lg:block lg:uppercase lg:tracking-wide lg:text-on-surface-variant">
          {title === 'Almuerzo'
            ? <Sun size={16} className="lg:hidden" aria-hidden="true" />
            : <Moon size={16} className="lg:hidden" aria-hidden="true" />}
          <span>{title}</span>
        </h3>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
          {slotList.map(slot => {
            const isSelected = selectedTime === slot.time
            const isDisabled = !slot.available

            return (
              <motion.button
                key={slot.time}
                type="button"
                onClick={() => slot.available && onSelectTime(slot.time)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                whileHover={!reduceMotion && slot.available ? { scale: 1.03 } : {}}
                whileTap={!reduceMotion && slot.available ? { scale: 0.97 } : {}}
                className={`
                  min-h-12 py-3 px-3 rounded-lg text-sm font-semibold transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:min-h-0 lg:px-4
                  ${isSelected ? 'bg-primary text-on-primary ring-2 ring-primary ring-offset-2' : ''}
                  ${!isSelected && slot.available ? 'bg-white border-2 border-outline-variant text-on-surface hover:border-primary' : ''}
                  ${isDisabled ? 'bg-surface-container text-on-surface-variant/40 cursor-not-allowed line-through' : ''}
                `}
              >
                <span className="flex items-center justify-center gap-1.5">
                  {isSelected && <Check size={15} strokeWidth={3} className="lg:hidden" aria-hidden="true" />}
                  {slot.time}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {renderSlots(lunchSlots, 'Almuerzo')}
      {renderSlots(dinnerSlots, 'Cena')}
    </div>
  )
}
