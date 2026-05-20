import { useState } from 'react'
import { motion } from 'motion/react'
import { Copy, Check, ExternalLink, LayoutDashboard, Share2 } from 'lucide-react'
import { AnimatedCheck } from './AnimatedCheck'
import type { BrandSettings } from '@/features/setup/state/setupTypes'
import { getFontCss } from '../branding/brandingUtils'

interface SuccessViewProps {
  brand: BrandSettings
}

const NEXT_STEPS = [
  { icon: <Share2 size={14} />, text: 'Compartí tu link en redes sociales' },
  { icon: <LayoutDashboard size={14} />, text: 'Explorá el panel de administración' },
  { icon: <ExternalLink size={14} />, text: 'Hacé una reserva de prueba en tu agenda' },
]

export function SuccessView({ brand }: SuccessViewProps) {
  const [copied, setCopied] = useState(false)
  const agendaUrl = `tuapp.com/r/${brand.slug || 'mi-agenda'}`
  const headingFont = getFontCss(brand.headingFont)

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${agendaUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4 px-2">
      {/* Animated check */}
      <AnimatedCheck color="var(--color-primary)" />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="flex flex-col gap-2"
      >
        <h2 style={{
          fontFamily: headingFont,
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: 700,
          color: 'var(--color-on-surface)',
          lineHeight: 1.2,
          margin: 0,
        }}>
          ¡Tu agenda está lista!
        </h2>
        <p className="text-sm text-on-surface-variant" style={{ maxWidth: 420 }}>
          Comenzá a recibir reservas ahora mismo. Tu agenda pública ya está disponible.
        </p>
      </motion.div>

      {/* URL copiable */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="flex items-center gap-2 border border-outline-variant rounded-xl bg-surface-container-lowest px-4 py-3 w-full"
        style={{ maxWidth: 420 }}
      >
        <span className="flex-1 text-sm font-mono text-on-surface truncate">{agendaUrl}</span>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1 text-xs font-semibold transition-all shrink-0 ${copied ? 'text-green-600' : 'text-primary'}`}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05, duration: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 w-full"
        style={{ maxWidth: 420 }}
      >
        <button
          type="button"
          onClick={() => window.open(`https://${agendaUrl}`, '_blank')}
          className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-primary rounded-xl text-sm font-semibold text-primary transition-all hover:bg-surface-container active:scale-[0.98]"
        >
          <ExternalLink size={14} /> Ver mi agenda
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-on-primary bg-primary transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <LayoutDashboard size={14} /> Ir al panel
        </button>
      </motion.div>

      {/* Próximos pasos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="w-full text-left"
        style={{ maxWidth: 420 }}
      >
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-3">
          Próximos pasos sugeridos
        </p>
        <div className="flex flex-col gap-2">
          {NEXT_STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 + i * 0.1, duration: 0.3 }}
              className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-2.5"
            >
              <span className="text-primary">{step.icon}</span>
              <span className="text-sm text-on-surface">{step.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
