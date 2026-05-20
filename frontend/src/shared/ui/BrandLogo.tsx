import type React from 'react'
import { cn } from '@/shared/lib/cn'

interface BrandLogoProps {
  className?: string
  variant?: 'primary' | 'white'
  style?: React.CSSProperties
}

export function BrandLogo({ className, variant = 'primary', style }: BrandLogoProps) {
  return (
    <span
      className={cn(
        'font-serif text-2xl font-bold block',
        variant === 'primary' ? 'text-primary' : 'text-white',
        className,
      )}
      style={style}
    >
      Turnify
    </span>
  )
}
