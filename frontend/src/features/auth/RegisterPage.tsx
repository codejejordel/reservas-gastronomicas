import { Link } from '@tanstack/react-router'

export function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm p-md">
        <h1 className="font-serif text-3xl font-bold text-on-surface mb-md">
          Creá tu cuenta
        </h1>
        <p className="text-on-surface-variant text-sm">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
