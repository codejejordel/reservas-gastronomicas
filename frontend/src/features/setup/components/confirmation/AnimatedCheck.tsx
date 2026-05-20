import { motion } from 'motion/react'
import { Check } from 'lucide-react'

interface AnimatedCheckProps {
  color?: string
}

export function AnimatedCheck({ color = '#005759' }: AnimatedCheckProps) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
      {/* Ripple waves */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ border: `2px solid ${color}`, width: 100, height: 100 }}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2.8, opacity: 0 }}
          transition={{
            duration: 2,
            ease: 'easeOut',
            delay: i * 0.5,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      ))}

      {/* Circle background */}
      <motion.div
        className="relative z-10 rounded-full flex items-center justify-center"
        style={{ width: 72, height: 72, background: color }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3, ease: 'easeOut' }}
        >
          <Check size={32} color="white" strokeWidth={3} />
        </motion.div>
      </motion.div>
    </div>
  )
}
