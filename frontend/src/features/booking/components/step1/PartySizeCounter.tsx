import { Minus, Plus } from 'lucide-react'
import { motion } from 'motion/react'

interface PartySizeCounterProps {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
}

export function PartySizeCounter({ value, onChange, min = 1, max = 20 }: PartySizeCounterProps) {
  const canDecrease = value > min
  const canIncrease = value < max

  return (
    <div className="bg-white border-2 border-primary rounded-full px-6 py-3 inline-flex items-center gap-4">
      <motion.button
        type="button"
        onClick={() => canDecrease && onChange(value - 1)}
        disabled={!canDecrease}
        whileHover={canDecrease ? { scale: 1.1 } : {}}
        whileTap={canDecrease ? { scale: 0.95 } : {}}
        className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
      >
        <Minus size={16} />
      </motion.button>

      <div className="min-w-[120px] text-center">
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
        whileHover={canIncrease ? { scale: 1.1 } : {}}
        whileTap={canIncrease ? { scale: 0.95 } : {}}
        className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
      >
        <Plus size={16} />
      </motion.button>
    </div>
  )
}
