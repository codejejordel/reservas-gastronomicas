import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Plus, Store, MapPin, Phone } from 'lucide-react'
import { useSetupWizard } from '@/features/setup/state/SetupWizardContext'
import type { Venue } from '@/features/setup/state/setupTypes'
import { InputWithIcon } from '@/shared/ui/InputWithIcon'
import { FieldLabel } from '@/shared/ui/FieldLabel'
import { FadeUp } from '@/features/auth/components/animations/FadeUp'
import { VenueCard } from './VenueCard'

type DraftVenue = Omit<Venue, 'id'>

const emptyDraft = (): DraftVenue => ({ name: '', address: '', phone: '' })

export function Step1Venues() {
  const { venues, addVenue, updateVenue, removeVenue, nextStep } = useSetupWizard()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState<DraftVenue>(emptyDraft())

  const saveDraft = () => {
    if (!draft.name.trim()) return
    addVenue(draft)
    setDraft(emptyDraft())
  }

  return (
    <FadeUp delay={0.1}>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.4rem' }}>
        Registrá tus locales
      </h2>
      <p className="text-sm text-on-surface-variant mb-6">
        Podés tener múltiples locales bajo la misma cuenta. Agregá uno ahora y el resto después.
      </p>

      {/* New venue form */}
      <div style={{ border: '1.5px solid var(--color-primary)', borderRadius: '0.875rem', padding: '1.25rem', background: 'white', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '0.5rem', flexShrink: 0, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={16} color="white" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {draft.name.trim() || 'Nuevo local'}
            </p>
            {draft.address && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {draft.address}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <FieldLabel>Nombre del local</FieldLabel>
            <InputWithIcon icon={Store} type="text" placeholder="Ej: La Parrilla de Roberto — Palermo"
              value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Dirección</FieldLabel>
            <InputWithIcon icon={MapPin} type="text" placeholder="Av. Corrientes 1234, Buenos Aires"
              value={draft.address} onChange={e => setDraft(d => ({ ...d, address: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Teléfono de contacto</FieldLabel>
            <InputWithIcon icon={Phone} type="tel" placeholder="+54 11 1234-5678"
              value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} />
          </div>
        </div>

        <motion.button type="button" onClick={saveDraft}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          disabled={!draft.name.trim()}
          className="mt-4 w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-primary text-on-primary disabled:bg-surface-container disabled:text-on-surface-variant disabled:cursor-not-allowed"
        >
          <Plus size={14} /> Agregar local
        </motion.button>
      </div>

      {/* Saved venues */}
      <AnimatePresence initial={false}>
        {venues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', overflow: 'hidden' }}
          >
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem' }}>
              Locales agregados ({venues.length})
            </p>
            <AnimatePresence initial={false}>
              {venues.map((venue, idx) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  index={idx}
                  isEditing={editingId === venue.id}
                  canDelete
                  onEdit={() => setEditingId(venue.id)}
                  onCollapse={() => setEditingId(null)}
                  onDelete={() => removeVenue(venue.id)}
                  onChange={(field, value) => updateVenue(venue.id, { [field]: value })}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button type="button"
        onClick={nextStep}
        whileHover={{ opacity: 0.9, y: -1 }} whileTap={{ scale: 0.98 }}
        className="w-full py-3 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-px hover:shadow-lg transition-all active:scale-[0.98]"
      >
        Continuar →
      </motion.button>
    </FadeUp>
  )
}
