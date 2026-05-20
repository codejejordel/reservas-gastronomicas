import { Link } from '@tanstack/react-router'

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm p-md">
        <h1 className="font-serif text-3xl font-bold text-on-surface mb-md">
          Iniciá sesión
        </h1>
        <p className="text-on-surface-variant text-sm">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Registrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
