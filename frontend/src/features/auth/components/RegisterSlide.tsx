import { useIsMobile } from '@/shared/hooks/useIsMobile'
import { HeroPanel } from './hero/HeroPanel'
import { HeroRegisterContent } from './hero/HeroRegisterContent'
import { RegisterForm } from './forms/RegisterForm'

interface RegisterSlideProps {
  onGoToLogin: () => void
}

export function RegisterSlide({ onGoToLogin }: RegisterSlideProps) {
  const isMobile = useIsMobile(1024)

  if (isMobile) {
    return (
      <div style={{ width: '100vw', height: '100vh', flexShrink: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <HeroPanel style={{ width: '100%', minHeight: 220, flexShrink: 0 }} mobile>
          <HeroRegisterContent mobile />
        </HeroPanel>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <RegisterForm onGoToLogin={onGoToLogin} />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ width: '100vw', height: '100vh', flexShrink: 0, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}
    >
      <div style={{ width: '42%', height: '100%', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3rem' }}>
        <RegisterForm onGoToLogin={onGoToLogin} />
      </div>

      <HeroPanel style={{ width: '58%', height: '100%' }}>
        <HeroRegisterContent />
      </HeroPanel>
    </div>
  )
}
