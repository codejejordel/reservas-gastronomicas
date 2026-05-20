import { useIsMobile } from '@/shared/hooks/useIsMobile'
import { HeroPanel } from './hero/HeroPanel'
import { HeroLoginContent } from './hero/HeroLoginContent'
import { LoginForm } from './forms/LoginForm'

interface LoginSlideProps {
  onGoToRegister: () => void
}

export function LoginSlide({ onGoToRegister }: LoginSlideProps) {
  const isMobile = useIsMobile(1024)

  if (isMobile) {
    return (
      <div style={{ width: '100vw', height: '100vh', flexShrink: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <HeroPanel style={{ width: '100%', minHeight: 220, flexShrink: 0 }} mobile>
          <HeroLoginContent mobile />
        </HeroPanel>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <LoginForm onGoToRegister={onGoToRegister} />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ width: '100vw', height: '100vh', flexShrink: 0, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}
    >
      <HeroPanel style={{ width: '58%', height: '100%' }}>
        <HeroLoginContent />
      </HeroPanel>

      <div style={{ width: '42%', height: '100%', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3rem' }}>
        <LoginForm onGoToRegister={onGoToRegister} />
      </div>
    </div>
  )
}
