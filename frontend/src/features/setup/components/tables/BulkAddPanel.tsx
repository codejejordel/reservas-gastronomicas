import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Users, X } from 'lucide-react'

interface BulkAddPanelProps {
  nextNumber: number
  onConfirm: (opts: { count: number; prefix: string; startNumber: number; capacity: number }) => void
  onCancel: () => void
}

const inputClass = [
  'border border-outline-variant rounded-lg bg-white px-3 py-2',
  'text-sm text-on-surface font-medium outline-none w-full',
  'focus:border-primary focus:shadow-[0_0_0_2px_rgba(7,169,169,0.15)] transition-all',
].join(' ')

export function BulkAddPanel({ nextNumber, onConfirm, onCancel }: BulkAddPanelProps) {
  const [count, setCount] = useState(5)
  const [prefix, setPrefix] = useState('Mesa')
  const [startNumber, setStartNumber] = useState(nextNumber)
  const [capacity, setCapacity] = useState(4)

  const preview = count <= 5
    ? Array.from({ length: count }, (_, i) => `${prefix} ${startNumber + i}`).join(', ')
    : `${prefix} ${startNumber}, ${prefix} ${startNumber + 1}, ... ${prefix} ${startNumber + count - 1}`

  const handleConfirm = () => {
    if (count < 1 || !prefix.trim()) return
    onConfirm({ count, prefix: prefix.trim(), startNumber, capacity })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="overflow-hidden"
      >
        <div className="border border-outline-variant rounded-xl bg-surface-container-lowest p-4 mt-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-on-surface">Agregar varias mesas</p>
            <button type="button" onClick={onCancel} className="text-on-surface-variant hover:text-on-surface p-1 rounded-md transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-on-surface-variant">Cantidad</label>
              <input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={e => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-on-surface-variant">Prefijo</label>
              <input
                type="text"
                value={prefix}
                onChange={e => setPrefix(e.target.value)}
                placeholder="Mesa"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-on-surface-variant">Empezar desde</label>
              <input
                type="number"
                min={1}
                value={startNumber}
                onChange={e => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-on-surface-variant flex items-center gap-1"><Users size={11} /> Capacidad</label>
              <input
                type="number"
                min={1}
                max={99}
                value={capacity}
                onChange={e => setCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Preview */}
          <p className="text-xs text-on-surface-variant bg-surface-container rounded-lg px-3 py-2">
            <span className="font-semibold text-on-surface">Vista previa: </span>{preview}
          </p>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container transition-all"
            >
              Cancelar
            </button>
            <motion.button
              type="button"
              onClick={handleConfirm}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 text-xs font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all"
            >
              Crear {count} mesa{count !== 1 ? 's' : ''}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
