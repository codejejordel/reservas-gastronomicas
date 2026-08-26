import { Minus, Plus } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

interface PartySizeCounterProps {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
}

export function PartySizeCounter({ value, onChange, min = 1, max = 20 }: PartySizeCounterProps) {
  const canDecrease = value > min
  const canIncrease = value < max
  const reduceMotion = useReducedMotion()

  return (
    <div className="inline-flex max-w-full items-center gap-3 rounded-full border-2 border-primary bg-white px-3 py-2 lg:gap-4 lg:px-6 lg:py-3">
      <motion.button
        type="button"
        onClick={() => canDecrease && onChange(value - 1)}
        disabled={!canDecrease}
        whileHover={!reduceMotion && canDecrease ? { scale: 1.1 } : {}}
        whileTap={!reduceMotion && canDecrease ? { scale: 0.95 } : {}}
        aria-label="Quitar una persona"
        className="w-11 h-11 lg:w-8 lg:h-8 rounded-full bg-primary text-on-primary flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-opacity motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Minus size={16} />
      </motion.button>

      <div className="min-w-[92px] text-center lg:min-w-[120px]" aria-live="polite">
        <div className="text-2xl font-bold text-on-surface tabular-nums">
          {value}
        </div>
        <div className="text-xs text-on-surface-variant uppercase tracking-wide font-semibold">
          {value === 1 ? 'Persona' : 'Personas'}
        </div>
      </div>

      <motion.button
        type="button"
        onClick={() => canIncrease && onChange(value + 1)}
        disabled={!canIncrease}
        whileHover={!reduceMotion && canIncrease ? { scale: 1.1 } : {}}
        whileTap={!reduceMotion && canIncrease ? { scale: 0.95 } : {}}
        aria-label="Agregar una persona"
        className="w-11 h-11 lg:w-8 lg:h-8 rounded-full bg-primary text-on-primary flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-opacity motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Plus size={16} />
      </motion.button>
    </div>
  )
}
