import { type LucideIcon } from 'lucide-react'
import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon
  rightSlot?: ReactNode
  error?: boolean
}

export const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ icon: Icon, rightSlot, error, className, ...props }, ref) => {
    return (
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-outline pointer-events-none" />
        <input
          ref={ref}
          className={cn(
            'w-full pl-10 pr-3 py-3 border rounded-lg bg-white text-sm text-on-surface',
            'placeholder:text-outline-variant transition-all',
            'focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(7,169,169,0.14)]',
            error
              ? 'border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(186,26,26,0.14)]'
              : 'border-outline-variant',
            rightSlot && 'pr-10',
            className,
          )}
          {...props}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
    )
  },
)
InputWithIcon.displayName = 'InputWithIcon'
