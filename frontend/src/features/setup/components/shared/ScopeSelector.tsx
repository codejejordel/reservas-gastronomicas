import { Globe, Store } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { Venue } from '@/features/setup/state/setupTypes'

interface ScopeSelectorProps {
  venues: Venue[]
  scope: 'global' | number
  onScopeChange: (scope: 'global' | number) => void
}

export function ScopeSelector({ venues, scope, onScopeChange }: ScopeSelectorProps) {
  if (venues.length < 2) return null

  return (
    <div className="flex gap-2 flex-wrap mb-5">
      <button
        type="button"
        onClick={() => onScopeChange('global')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${scope === 'global' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
      >
        <Globe size={12} /> Todos los locales
      </button>
      {venues.map((v, i) => (
        <button
          key={v.id}
          type="button"
          onClick={() => onScopeChange(v.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${scope === v.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
        >
          <Store size={12} /> {v.name || `Local ${i + 1}`}
        </button>
      ))}
    </div>
  )
}

interface ScopeOverrideBannerProps {
  scope: 'global' | number
  hasOverride: boolean
  entityLabel: string
  onEnable: () => void
  onDisable: () => void
}

export function ScopeOverrideBanner({ scope, hasOverride, entityLabel, onEnable, onDisable }: ScopeOverrideBannerProps) {
  return (
    <AnimatePresence>
      {typeof scope === 'number' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 overflow-hidden"
        >
          {hasOverride ? (
            <div className="flex items-center justify-between bg-primary-container rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-on-primary-container">{entityLabel} personalizado para este local</p>
              <button type="button" onClick={onDisable} className="text-xs font-semibold text-primary hover:underline">
                Usar configuración global
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-surface-container rounded-xl px-4 py-3">
              <p className="text-xs text-on-surface-variant">Usando configuración global</p>
              <button type="button" onClick={onEnable} className="text-xs font-semibold text-primary hover:underline">
                Personalizar
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
