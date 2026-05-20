import { ArrowLeft } from 'lucide-react'

interface BackToLoginButtonProps {
  onClick: () => void
}

export function BackToLoginButton({ onClick }: BackToLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6"
    >
      <ArrowLeft className="w-4 h-4" />
      Volver al inicio de sesión
    </button>
  )
}
