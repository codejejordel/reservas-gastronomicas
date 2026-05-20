import type { ReactNode } from 'react'

interface FieldLabelProps {
  children: ReactNode
  htmlFor?: string
}

export function FieldLabel({ children, htmlFor }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1 tracking-wide"
    >
      {children}
    </label>
  )
}
