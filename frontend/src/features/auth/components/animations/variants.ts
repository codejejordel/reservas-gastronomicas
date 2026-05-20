import type { Variants } from 'motion/react'

export const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

export const itemTransition = { duration: 0.42, ease: 'easeOut' as const }
export const itemExitTransition = { duration: 0.2 }
