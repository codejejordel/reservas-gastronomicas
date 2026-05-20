import { AnimatePresence, motion } from 'motion/react'
import { Pencil, Trash2, Store, MapPin, Phone } from 'lucide-react'
import type { Venue } from '@/features/setup/state/setupTypes'
import { InputWithIcon } from '@/shared/ui/InputWithIcon'
import { FieldLabel } from '@/shared/ui/FieldLabel'

interface VenueCardProps {
  venue: Venue
  index: number
  isEditing: boolean
  canDelete: boolean
  onEdit: () => void
  onCollapse: () => void
  onDelete: () => void
  onChange: (field: keyof Omit<Venue, 'id'>, value: string) => void
}

export function VenueCard({ venue, index, isEditing, canDelete, onEdit, onCollapse, onDelete, onChange }: VenueCardProps) {
  const displayName = venue.name.trim() || `Local ${index + 1}`

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -24, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.32, 0, 0.24, 1] }}
      style={{
        border: `1.5px solid ${isEditing ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
        borderRadius: '0.875rem',
        background: isEditing ? 'white' : 'var(--color-surface-container-lowest)',
        overflow: 'hidden',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '0.5rem', flexShrink: 0,
          background: isEditing ? 'var(--color-primary)' : 'var(--color-surface-container)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}>
          <Store size={16} color={isEditing ? 'white' : 'var(--color-on-surface-variant)'} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayName}
          </p>
          {!isEditing && venue.address && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {venue.address}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
          <button type="button" onClick={isEditing ? onCollapse : onEdit}
            style={{ background: isEditing ? 'var(--color-primary)' : 'var(--color-surface-container)', border: 'none', cursor: 'pointer', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: isEditing ? 'white' : 'var(--color-primary)', transition: 'all 0.2s' }}>
            <Pencil size={12} />
            {isEditing ? 'Listo' : 'Editar'}
          </button>
          {canDelete && (
            <button type="button" onClick={onDelete}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: '0.4rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center' }}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isEditing && (
          <motion.div
            key="form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0, 0.24, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-3 flex flex-col gap-3 border-t border-outline-variant">
              <div>
                <FieldLabel>Nombre del local</FieldLabel>
                <InputWithIcon icon={Store} type="text" placeholder="Ej: La Parrilla de Roberto — Palermo"
                  value={venue.name} onChange={e => onChange('name', e.target.value)} autoFocus />
              </div>
              <div>
                <FieldLabel>Dirección</FieldLabel>
                <InputWithIcon icon={MapPin} type="text" placeholder="Av. Corrientes 1234, Buenos Aires"
                  value={venue.address} onChange={e => onChange('address', e.target.value)} />
              </div>
              <div>
                <FieldLabel>Teléfono de contacto</FieldLabel>
                <InputWithIcon icon={Phone} type="tel" placeholder="+54 11 1234-5678"
                  value={venue.phone} onChange={e => onChange('phone', e.target.value)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
