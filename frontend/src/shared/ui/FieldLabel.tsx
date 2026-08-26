import type { ReactNode } from 'react'

interface FieldLabelProps {
  children: ReactNode
  htmlFor?: string
  className?: string
}

export function FieldLabel({ children, htmlFor, className = '' }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-[11px] font-bold text-on-surface-variant uppercase mb-1 tracking-wide ${className}`}
    >
      {children}
    </label>
  )
}
