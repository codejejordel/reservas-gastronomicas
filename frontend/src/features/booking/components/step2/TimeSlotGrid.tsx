import { motion } from 'motion/react'
import type { TimeSlot } from '../../types/bookingTypes'

interface TimeSlotGridProps {
  slots: TimeSlot[]
  selectedTime: string | null
  onSelectTime: (time: string) => void
}

export function TimeSlotGrid({ slots, selectedTime, onSelectTime }: TimeSlotGridProps) {
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
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wide mb-3">
          {title}
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {slotList.map(slot => {
            const isSelected = selectedTime === slot.time
            const isDisabled = !slot.available

            return (
              <motion.button
                key={slot.time}
                type="button"
                onClick={() => slot.available && onSelectTime(slot.time)}
                disabled={isDisabled}
                whileHover={slot.available ? { scale: 1.03 } : {}}
                whileTap={slot.available ? { scale: 0.97 } : {}}
                className={`
                  py-3 px-4 rounded-lg text-sm font-semibold transition-all
                  ${isSelected ? 'bg-primary text-on-primary ring-2 ring-primary ring-offset-2' : ''}
                  ${!isSelected && slot.available ? 'bg-white border-2 border-outline-variant text-on-surface hover:border-primary' : ''}
                  ${isDisabled ? 'bg-surface-container text-on-surface-variant/40 cursor-not-allowed line-through' : ''}
                `}
              >
                {slot.time}
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
