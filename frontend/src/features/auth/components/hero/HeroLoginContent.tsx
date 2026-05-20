import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { useEffect } from 'react'
import { HeroBadge } from './HeroBadge'
import { FloatCard } from './FloatCard'

const STATS = [
  { id: 'restaurants', to: 1240, prefix: '', suffix: '+', label: 'Restaurantes', decimals: 0 },
  { id: 'noshows', to: 28, prefix: '-', suffix: '%', label: 'Menos no-shows', decimals: 0 },
  { id: 'rating', to: 4.9, prefix: '', suffix: '★', label: 'Valoración', decimals: 1 },
]

function StatCounter({ to, prefix, suffix, label, decimals, delay }: {
  to: number; prefix: string; suffix: string; label: string; decimals: number; delay: number
}) {
  const val = useMotionValue(0)
  const display = useTransform(val, (v) =>
    `${prefix}${decimals ? v.toFixed(decimals) : Math.round(v)}${suffix}`,
  )
  useEffect(() => {
    const c = animate(val, to, { duration: 1.6, ease: 'easeOut', delay })
    return c.stop
  }, [val, to, delay])

  return (
    <div className="flex flex-col">
      <motion.span className="text-2xl font-bold text-primary-fixed font-serif">
        {display}
      </motion.span>
      <span className="text-[11px] font-bold text-white/50 uppercase tracking-wide">{label}</span>
    </div>
  )
}

interface HeroLoginContentProps {
  mobile?: boolean
}

export function HeroLoginContent({ mobile }: HeroLoginContentProps = {}) {
  return (
    <div style={{ width: '100%' }}>
      <HeroBadge text="Plataforma líder hostelería" />
      <h1
        className="text-white leading-tight mb-0"
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: mobile ? 'clamp(1.6rem, 7vw, 2.2rem)' : 'clamp(1.5rem, 3.2vw, 3rem)',
          fontWeight: 700,
          lineHeight: 1.15,
          marginTop: '0.5rem',
        }}
      >
        Tu sala, bajo{' '}
        <em className="not-italic text-primary-fixed">control total.</em>
      </h1>
      {!mobile && (
        <>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', maxWidth: 340, marginTop: '1.5rem', lineHeight: 1.6 }}>
            Miles de restaurantes ya gestionan reservas, mesas y clientes desde un solo panel.
            Simple, elegante, efectivo.
          </p>
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            {STATS.map((s, i) => (
              <StatCounter key={s.id} {...s} delay={0.65 + i * 0.12} />
            ))}
          </div>
          <FloatCard />
        </>
      )}
    </div>
  )
}
