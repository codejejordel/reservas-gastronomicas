import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useSetupWizard } from '@/features/setup/state/SetupWizardContext'
import { clearWizardProgress } from '@/features/setup/state/setupPersistence'
import { ReviewView } from '../confirmation/ReviewView'
import { SuccessView } from '../confirmation/SuccessView'

type View = 'review' | 'success'

export function Step5Confirmation() {
  const { brand, restaurant } = useSetupWizard()
  const [view, setView] = useState<View>('review')

  const handleSubmit = () => {
    clearWizardProgress()
    setView('success')
  }

  return (
    <AnimatePresence mode="wait">
      {view === 'review' ? (
        <motion.div
          key="review"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28, ease: [0.32, 0, 0.24, 1] }}
        >
          <ReviewView submitting={false} onSubmit={handleSubmit} />
        </motion.div>
      ) : (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.32, 0, 0.24, 1] }}
        >
          <SuccessView brand={brand} restaurant={restaurant} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
