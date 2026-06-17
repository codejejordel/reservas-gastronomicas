import { motion } from 'motion/react'

interface ButtonStepersProps {
  onNext?: () => void
  onBack?: () => void
  nextDisabled?: boolean
  backDisabled?: boolean
  nextLabel?: string
  backLabel?: string
  showBack?: boolean
  showNext?: boolean
  loading?: boolean
}

export function ButtonStepers({
  onNext,
  onBack,
  nextDisabled = false,
  backDisabled = false,
  nextLabel = 'Continuar →',
  backLabel = '← Atrás',
  showBack = true,
  showNext = true,
  loading = false,
}: ButtonStepersProps) {
  return (
    <div className="flex justify-end gap-3 mt-6">
      {showBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled || loading}
          className="flex-1 lg:flex-none lg:w-24 py-3 border border-outline-variant text-on-surface rounded-lg text-sm font-semibold hover:bg-surface-container transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {backLabel}
        </button>
      )}

      {showNext && (
        <motion.button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || loading}
          whileHover={!nextDisabled && !loading ? { opacity: 0.9, y: -1 } : {}}
          whileTap={!nextDisabled && !loading ? { scale: 0.98 } : {}}
          className={`${showBack ? 'lg:w-48 lg:flex-none flex-2' : 'w-full lg:w-48'} py-3 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-px hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : (
            nextLabel
          )}
        </motion.button>
      )}
    </div>
  )
}