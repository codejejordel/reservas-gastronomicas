import { type ReactNode } from 'react'
import type React from 'react'
import { motion } from 'motion/react'
import { HeroBackground } from './HeroBackground'
import { BrandLogo } from '@/shared/ui/BrandLogo'
import { cn } from '@/shared/lib/cn'

interface HeroPanelProps {
  children: ReactNode
  floatCard?: ReactNode
  className?: string
  style?: React.CSSProperties
  mobile?: boolean
}

export function HeroPanel({ children, floatCard, className, style, mobile }: HeroPanelProps) {
  const mobileStyle = mobile ? {
    justifyContent: 'flex-end' as const,
    paddingBottom: 48,
    paddingTop: '2rem',
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
  } : {
    justifyContent: 'center' as const,
    padding: '2.5rem 3rem',
  }

  return (
    <motion.div
      className={cn('hero-panel relative overflow-hidden flex flex-col', className)}
      style={{
        background: 'linear-gradient(145deg,#003536 0%,#005759 40%,#07a7a9 100%)',
        flexShrink: 0,
        ...mobileStyle,
        ...style,
      }}
      animate={mobile ? {
        clipPath: [
          'ellipse(120% 90% at 50% 10%)',
          'ellipse(115% 86% at 50% 10%)',
          'ellipse(120% 90% at 50% 10%)',
        ],
      } : {}}
      transition={mobile ? { duration: 6, ease: 'easeInOut', repeat: Infinity } : {}}
    >
      <HeroBackground />
      {!mobile && (
        <div style={{ position: 'absolute', top: '2.5rem', left: '3rem', zIndex: 20 }}>
          <BrandLogo variant="white" />
        </div>
      )}
      {mobile && (
        <div style={{ textAlign: 'center', marginBottom: '1rem', zIndex: 20, position: 'relative' }}>
          <BrandLogo variant="white" />
        </div>
      )}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', textAlign: mobile ? 'center' : 'left' }}>
        {children}
      </div>
      {!mobile && floatCard}
    </motion.div>
  )
}
