import { motion } from 'motion/react'
import { useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface SuccessStateProps {
  title: string
  description: string
  onComplete?: () => void
  completeDelay?: number
}

export function SuccessState({ title, description, onComplete, completeDelay = 1200 }: SuccessStateProps) {
  useEffect(() => {
    if (!onComplete) return
    const t = setTimeout(onComplete, completeDelay)
    return () => clearTimeout(t)
  }, [onComplete, completeDelay])

  return (
    <motion.div
      className="flex flex-col items-center text-center gap-3 py-12"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div
        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.15, 1] }}
        transition={{ duration: 0.5, ease: 'easeOut', times: [0, 0.7, 1] }}
      >
        <CheckCircle2 className="w-8 h-8" />
      </motion.div>
      <h3 className="font-serif text-xl font-semibold text-on-surface">{title}</h3>
      <p className="text-sm text-on-surface-variant">{description}</p>
      {onComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
        >
          <motion.div
            style={{ width: 120, height: 3, borderRadius: 9999, background: 'var(--color-surface-container-high)', overflow: 'hidden' }}
          >
            <motion.div
              style={{ height: '100%', background: 'var(--color-primary)', borderRadius: 9999 }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: completeDelay / 1000, ease: 'linear', delay: 0.5 }}
            />
          </motion.div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>Preparando tu panel...</span>
        </motion.div>
      )}
    </motion.div>
  )
}
