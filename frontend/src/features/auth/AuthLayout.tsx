import { useNavigate, useRouterState } from '@tanstack/react-router'
import { AuthShell } from './components/AuthShell'

export function AuthLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()

  const activeMode = pathname.includes('/register') ? 'register' : 'login'

  return (
    <AuthShell
      activeMode={activeMode}
      onModeChange={(mode) =>
        navigate({ to: mode === 'login' ? '/login' : '/register' })
      }
    />
  )
}
