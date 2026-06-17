import { AnimatePresence, motion } from 'motion/react'
import { useBooking } from '../../state/BookingContext'
import { BookingStepper } from './BookingStepper'
import { BookingSidebar } from './BookingSidebar'

interface BookingLayoutProps {
  children: React.ReactNode
  onFinalizar?: () => void
  canFinalizar?: boolean
  submitting?: boolean
}

export function BookingLayout({ children, onFinalizar, canFinalizar, submitting }: BookingLayoutProps) {
  const { restaurante, currentStep } = useBooking()

  const cssVars = {
    '--color-primary': restaurante?.colorPrimario || 'var(--color-primary)',
    '--color-accent': restaurante?.colorAcento || 'var(--color-accent)',
  } as React.CSSProperties

  return (
    <div className="min-h-screen bg-surface" style={cssVars}>
      {/* Header */}
      <header className="bg-white border-b border-outline-variant sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ background: restaurante?.colorPrimario || 'var(--color-primary)' }}
            >
              {restaurante?.nombrePublico.charAt(0).toUpperCase() || 'T'}
            </div>
            <div>
              <h1 className="font-bold text-lg text-on-surface" style={{ fontFamily: "'Sora', sans-serif" }}>
                {restaurante?.nombrePublico || 'Turnify'}
              </h1>
              <p className="text-xs text-on-surface-variant">Reservá tu mesa</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
          {/* Left: Form */}
          <div className="order-2 lg:order-1">
            <BookingStepper />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.32, 0, 0.24, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Sidebar */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <BookingSidebar onFinalizar={onFinalizar} canFinalizar={canFinalizar} submitting={submitting} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-on-surface-variant">
            Powered by <span className="font-semibold text-primary">Turnify Systems</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
