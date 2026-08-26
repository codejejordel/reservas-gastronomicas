import { LogIn } from 'lucide-react'
import { useBooking } from '../../state/BookingContext'

export function LoginPromptBanner() {
  const { restaurante } = useBooking()
  return (
    <div className="rounded-xl px-0 py-2 flex items-center gap-3 shadow-none lg:bg-primary-container lg:px-4 lg:py-3 lg:shadow-none">
      <LogIn size={18} className="text-primary shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-on-primary-container">
          ¿Ya reservaste antes?{' '}
          <a href="/login" className="font-semibold underline hover:no-underline " style={{ color: restaurante?.colorPrimario || 'var(--color-primary)' }}>
            Iniciá sesión
          </a>
        </p>
      </div>
    </div>
  )
}
