import { AnimatePresence, motion } from 'motion/react'
import { useIsMobile } from '@/shared/hooks/useIsMobile'
import { HeroPanel } from './hero/HeroPanel'
import { HeroLoginContent } from './hero/HeroLoginContent'
import { HeroRegisterContent } from './hero/HeroRegisterContent'
import { LoginForm } from './forms/LoginForm'
import { RegisterForm } from './forms/RegisterForm'
import { LoginSlide } from './LoginSlide'
import { RegisterSlide } from './RegisterSlide'

type AuthMode = 'login' | 'register'

interface AuthShellProps {
  activeMode: AuthMode
  onModeChange: (mode: AuthMode) => void
}

const SWIPE_TRANSITION = {
  duration: 0.78,
  ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
}

function MobileShell({ activeMode, onModeChange }: AuthShellProps) {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Hero: fixed height, content fades */}
      <HeroPanel
        style={{ width: '100%', minHeight: 220, flexShrink: 0 }}
        mobile
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ width: '100%' }}
          >
            {activeMode === 'login'
              ? <HeroLoginContent mobile />
              : <HeroRegisterContent mobile />}
          </motion.div>
        </AnimatePresence>
      </HeroPanel>

      {/* Form: slides up on enter, falls down on exit */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={activeMode}>
          <motion.div
            key={activeMode}
            custom={activeMode}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.32, 0, 0.24, 1] }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              padding: '2rem 1.5rem',
              overflowY: 'auto',
            }}
          >
            {activeMode === 'login'
              ? <LoginForm onGoToRegister={() => onModeChange('register')} />
              : <RegisterForm onGoToLogin={() => onModeChange('login')} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export function AuthShell({ activeMode, onModeChange }: AuthShellProps) {
  const x = activeMode === 'login' ? '0%' : '-50%'
  const isMobile = useIsMobile(1024)

  if (isMobile) {
    return <MobileShell activeMode={activeMode} onModeChange={onModeChange} />
  }

  return (
    <div
      id="viewport"
      style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}
    >
      <motion.div
        id="track"
        className="flex"
        style={{ width: '200vw', height: '100vh', willChange: 'transform' }}
        animate={{ x }}
        transition={SWIPE_TRANSITION}
      >
        <LoginSlide onGoToRegister={() => onModeChange('register')} />
        <RegisterSlide onGoToLogin={() => onModeChange('login')} />
      </motion.div>
    </div>
  )
}
