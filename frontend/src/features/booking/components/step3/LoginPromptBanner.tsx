import { LogIn } from 'lucide-react'

export function LoginPromptBanner() {
  return (
    <div className="bg-primary-container rounded-xl px-4 py-3 flex items-center gap-3">
      <LogIn size={18} className="text-primary shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-on-primary-container">
          ¿Ya reservaste antes?{' '}
          <a href="/login" className="font-semibold underline hover:no-underline">
            Iniciá sesión
          </a>
        </p>
      </div>
    </div>
  )
}
