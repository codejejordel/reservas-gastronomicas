import type React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SetupWizardProvider, useSetupWizard } from '@/features/setup/state/SetupWizardContext'
import { HeroBackground } from '@/features/auth/components/hero/HeroBackground'
import { Step1Venues } from './steps/Step1Venues'
import { Step2Schedule } from './steps/Step2Schedule'
import { Step3Tables } from './steps/Step3Tables'
import { Step4Branding } from './steps/Step4Branding'
import { Step5Confirmation } from './steps/Step5Confirmation'

const STEPS = [
  { n: 1, label: 'Tus locales' },
  { n: 2, label: 'Horarios' },
  { n: 3, label: 'Mesas' },
  { n: 4, label: 'Agenda' },
  { n: 5, label: 'Listo' },
]

const STEP_COMPONENTS: Record<number, React.ComponentType> = {
  1: Step1Venues,
  2: Step2Schedule,
  3: Step3Tables,
  4: Step4Branding,
  5: Step5Confirmation,
}

function WizardShell() {
  const { currentStep, step4Expanded } = useSetupWizard()
  const StepContent = STEP_COMPONENTS[currentStep]
  const isWide = step4Expanded

  return (
    <motion.div
      style={{
        width: '100vw', height: '100vh',
        background: 'linear-gradient(145deg,#003536 0%,#005759 40%,#07a7a9 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <HeroBackground />

      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 32 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.32, 0, 0.24, 1], delay: 0.1 }}
        className={`relative z-10 w-full
          ${isWide ? 'mx-0 sm:mx-2 overflow-hidden' : 'mx-0 sm:mx-6 overflow-y-auto'}
          rounded-none sm:rounded-3xl
          ${isWide ? 'h-screen sm:h-[95vh]' : 'h-screen sm:h-auto sm:max-h-[90vh]'}
          shadow-none sm:shadow-[0_32px_80px_rgba(0,0,0,0.25)]`}
        style={{ background: 'rgba(255,255,255,0.97)', maxWidth: isWide ? 1280 : 680, transition: 'max-width 0.45s cubic-bezier(0.32,0,0.24,1)' }}
      >
        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 1 }}>
          <motion.div
            style={{ height: '100%', background: 'linear-gradient(90deg,#005759,#07a7a9)' }}
            animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        <div className={`px-4 pt-8 pb-10 ${isWide ? 'sm:px-6 h-full flex flex-col' : 'sm:px-10'}`}>
          {/* Steps pills — hidden on final success screen */}
          {currentStep < 5 && (
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}
            >
              {STEPS.filter(s => s.n < 5).map(({ n, label }) => (
                <div key={n} style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem',
                  fontWeight: n === currentStep ? 700 : 400,
                  background: n === currentStep ? 'var(--color-primary)' : n < currentStep ? 'var(--color-primary-container)' : 'var(--color-surface-container)',
                  color: n === currentStep ? 'var(--color-on-primary)' : n < currentStep ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
                  transition: 'all 0.3s ease',
                }}>
                  <span>{n < currentStep ? '✓' : n}</span>
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Step content — slides horizontally */}
          <div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.28, ease: [0.32, 0, 0.24, 1] }}
              >
                {StepContent ? <StepContent /> : (
                  <div className="py-12 text-center text-on-surface-variant text-sm">
                    Paso {currentStep} — próximamente
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function SetupWizardLayout() {
  return (
    <SetupWizardProvider>
      <WizardShell />
    </SetupWizardProvider>
  )
}
