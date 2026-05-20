import { motion } from 'motion/react'
import { getPasswordStrength } from '@/features/auth/schemas/registerSchema'

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label, color } = getPasswordStrength(password)
  const width = `${(score / 5) * 100}%`

  if (!password) return null

  return (
    <div className="mt-1">
      <div className="h-1 rounded-full bg-outline-variant overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          animate={{ width, backgroundColor: color }}
          transition={{ duration: 0.3 }}
        />
      </div>
      {label && (
        <p className="text-xs text-on-surface-variant mt-1">{label}</p>
      )}
    </div>
  )
}
