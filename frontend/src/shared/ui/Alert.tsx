import { motion } from 'motion/react'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

export type AlertVariant = 'error' | 'success' | 'warning' | 'info'

interface AlertProps {
  variant: AlertVariant
  title?: string
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; icon: string; title: string; content: string }> = {
  error: {
    bg: 'bg-error/10',
    border: 'border-error/20',
    icon: 'text-error',
    title: 'text-error',
    content: 'text-error',
  },
  success: {
    bg: 'bg-success/10',
    border: 'border-success/20',
    icon: 'text-success',
    title: 'text-success',
    content: 'text-success',
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    icon: 'text-warning',
    title: 'text-warning',
    content: 'text-warning',
  },
  info: {
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    icon: 'text-primary',
    title: 'text-primary',
    content: 'text-primary',
  },
}

const icons = {
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
}

export function Alert({ variant, title, children, className = '' }: AlertProps) {
  const styles = variantStyles[variant]
  const Icon = icons[variant]

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`p-3 rounded-lg border ${styles.bg} ${styles.border} ${className}`}
    >
      <div className="flex items-start gap-2">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.icon}`} />
        <div className="flex-1">
          {title && <p className={`text-sm font-medium ${styles.title} mb-0.5`}>{title}</p>}
          <div className={`text-sm font-medium ${styles.content}`}>{children}</div>
        </div>
      </div>
    </motion.div>
  )
}
