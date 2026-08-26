import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useSetupWizard } from '@/features/setup/state/SetupWizardContext'
import { FadeUp } from '@/features/auth/components/animations/FadeUp'
import { BrandingForm } from '../branding/BrandingForm'
import { AgendaPreview } from '../branding/AgendaPreview'
import { useSubmitStep4 } from '@/features/setup/hooks/useSubmitStep4'

function validate(brand: ReturnType<typeof useSetupWizard>['brand']): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!/^#[0-9a-fA-F]{6}$/.test(brand.primaryColor)) errors.primaryColor = 'Color inválido'
  return errors
}

export function Step4Branding() {
  const { brand, restaurant, setBrandField, prevStep, setStep4Expanded } = useSetupWizard()
  const { submit, isPending, error } = useSubmitStep4()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)
  const [desktopExpanded, setDesktopExpanded] = useState(false)

  const openPreview = () => {
    setDesktopExpanded(true)
    setStep4Expanded(true)
  }

  const closePreview = () => {
    setDesktopExpanded(false)
    setStep4Expanded(false)
  }

  useEffect(() => {
    if (!desktopExpanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDesktopExpanded(false)
        setStep4Expanded(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [desktopExpanded, setStep4Expanded])

  const handleFinish = async () => {
    const errs = validate(brand)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    await submit()
  }

  return (
    <FadeUp delay={0.1}>
      <AnimatePresence mode="wait">
        {!desktopExpanded ? (
          /* ── FORM MODE ─────────────────────────────────────── */
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-0"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.25rem' }}>
                  Personalizá tu agenda
                </h2>
                <p className="text-sm text-on-surface-variant mb-5">
                  Así se verá tu agenda pública. Podés cambiarlo en cualquier momento.
                </p>
              </div>
            </div>

            {/* Mobile: preview toggle */}
            <div className="lg:hidden mb-4">
              <button
                type="button"
                onClick={() => setMobilePreviewOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container transition-all"
              >
                {mobilePreviewOpen ? <EyeOff size={13} /> : <Eye size={13} />}
                {mobilePreviewOpen ? 'Ocultar vista previa' : 'Ver vista previa'}
              </button>
            </div>

            {/* Mobile preview (collapsible) */}
            {mobilePreviewOpen && (
              <div className="lg:hidden mb-5 bg-surface-container rounded-2xl p-3 overflow-hidden">
                <AgendaPreview brand={brand} restaurant={restaurant} />
              </div>
            )}

            <BrandingForm brand={brand} onChange={setBrandField} />

            {/* Validation errors */}
            {Object.keys(errors).length > 0 && (
              <div className="mt-3 p-3 bg-error-container rounded-xl">
                {Object.values(errors).map(err => (
                  <p key={err} className="text-xs text-error font-medium">{err}</p>
                ))}
              </div>
            )}

            {/* Footer */}
            {error && (
              <div className="p-3 bg-error-container rounded-xl text-xs text-error font-medium mt-2">
                {error.message}
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={isPending}
                className="flex-1 py-3 border border-outline-variant text-on-surface rounded-lg text-sm font-semibold hover:bg-surface-container transition-all active:scale-[0.98] disabled:opacity-50"
              >
                ← Atrás
              </button>
              {/* Desktop: botón "Vista previa" antes de Finalizar */}
              <button
                type="button"
                onClick={openPreview}
                disabled={isPending}
                className="hidden lg:flex items-center justify-center gap-1.5 flex-1 py-3 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-surface-container transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Vista previa
              </button>
              <motion.button
                type="button"
                onClick={handleFinish}
                disabled={isPending}
                whileHover={!isPending ? { opacity: 0.9, y: -1 } : {}}
                whileTap={!isPending ? { scale: 0.98 } : {}}
                className="flex-2 py-3 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? <><Loader2 size={15} className="animate-spin" /> Guardando...</> : 'Finalizar configuración ✓'}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* ── EXPANDED PREVIEW MODE (desktop only) ─────────── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.32, 0, 0.24, 1], delay: 0.15 }}
            className="hidden lg:flex flex-col"
            style={{ height: 'calc(95vh - 5rem)' }}
          >
            <div className="flex-1 bg-surface-container rounded-2xl p-4 overflow-hidden flex flex-col">
              <AgendaPreview
                brand={brand}
                restaurant={restaurant}
                expanded
                onClose={closePreview}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </FadeUp>
  )
}
