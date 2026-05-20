import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { useEffect } from 'react'

export function FloatCard() {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => {
    const controls = animate(count, 247, { duration: 1.6, ease: 'easeOut', delay: 0.9 })
    return controls.stop
  }, [count])

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.09)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        marginTop: '1.5rem',
        width: 'fit-content',
        minWidth: 180,
      }}
    >
      <p className="text-[11px] font-bold text-white/50 uppercase mb-1">Reservas hoy</p>
      <motion.p className="text-2xl font-bold text-white font-serif">{rounded}</motion.p>
      <p className="text-xs text-primary-fixed mt-1">↑ 18% respecto a ayer</p>
      <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg,#5bd9da,#7bf5f7)' }}
          initial={{ width: 0 }}
          animate={{ width: '72%' }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 1 }}
        />
      </div>
    </div>
  )
}
