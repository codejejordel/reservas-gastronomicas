import { motion } from 'motion/react'

interface ToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  size?: 'sm' | 'md'
}

export function Toggle({ enabled, onChange, size = 'md' }: ToggleProps) {
  const trackW = size === 'sm' ? 32 : 40
  const trackH = size === 'sm' ? 18 : 22
  const knobSize = size === 'sm' ? 12 : 16
  const travel = trackW - trackH

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      style={{
        width: trackW, height: trackH,
        borderRadius: trackH,
        background: enabled ? 'var(--color-primary)' : 'var(--color-outline-variant)',
        border: 'none', cursor: 'pointer', padding: 0,
        position: 'relative', flexShrink: 0,
        transition: 'background 0.2s ease',
      }}
    >
      <motion.div
        animate={{ x: enabled ? travel - (trackH - knobSize) / 2 : (trackH - knobSize) / 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        style={{
          position: 'absolute',
          top: (trackH - knobSize) / 2,
          left: 0,
          width: knobSize, height: knobSize,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}
