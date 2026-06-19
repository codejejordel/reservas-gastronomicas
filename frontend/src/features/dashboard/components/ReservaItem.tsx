import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, X, Users } from 'lucide-react'
import { useReservaTimer } from '../hooks/useReservaTimer'
import { useCompletarReserva } from '../hooks/useCompletarReserva'
import { useMarcarNoShow } from '../hooks/useMarcarNoShow'
import { HEARTBEAT_DURATION_MS, FADEOUT_DURATION_MS } from '../constants'
import type { ReservaDashboard } from '../types'

interface ReservaItemProps {
  reserva: ReservaDashboard
  onRemove: (id: number) => void
}

export function ReservaItem({ reserva, onRemove }: ReservaItemProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const timer = useReservaTimer(reserva.horaReserva)
  const completar = useCompletarReserva()
  const noShow = useMarcarNoShow()

  const handleCompletar = () => {
    completar.mutate(reserva.id)
  }

  const handleNoShow = () => {
    setIsRemoving(true)
    setTimeout(() => {
      noShow.mutate(reserva.id)
      onRemove(reserva.id)
    }, FADEOUT_DURATION_MS + HEARTBEAT_DURATION_MS)
  }

  const isOvertime = timer.status === 'overtime'
  const isExpired = timer.status === 'expired'

  // Expired → heartbeat → fadeout → remove
  if (isExpired && !isRemoving) {
    setIsRemoving(true)
    setTimeout(() => onRemove(reserva.id), HEARTBEAT_DURATION_MS + FADEOUT_DURATION_MS)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={
        isRemoving
          ? {
              scale: [1, 1.03, 1, 1.03, 1],
              opacity: [1, 1, 1, 1, 0],
            }
          : { opacity: 1, y: 0 }
      }
      transition={
        isRemoving
          ? { duration: (HEARTBEAT_DURATION_MS + FADEOUT_DURATION_MS) / 1000, ease: 'easeInOut' }
          : { duration: 0.3 }
      }
      className={
        `relative flex items-center gap-3 p-3 rounded-2xl border transition-colors ` +
        (isOvertime
          ? 'bg-red-500/5 border-red-500/20'
          : 'bg-surface-container-high/50 border-outline-variant/30')
      }
    >
      {/* Avatares placeholder (comensales) */}
      <div className="flex -space-x-1.5 shrink-0">
        {Array.from({ length: Math.min(reserva.cantPersonas, 3) }).map((_, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-full bg-primary/10 border-2 border-surface-container flex items-center justify-center"
          >
            <Users size={10} className="text-primary" />
          </div>
        ))}
        {reserva.cantPersonas > 3 && (
          <div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-surface-container flex items-center justify-center text-[9px] font-medium text-on-surface-variant">
            +{reserva.cantPersonas - 3}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-on-surface truncate">
          {reserva.clienteNombre}
        </p>
        <p className="text-[11px] text-on-surface-variant">
          {reserva.cantPersonas} {reserva.cantPersonas === 1 ? 'comensal' : 'comensales'}
        </p>
      </div>

      {/* Hora + Acciones */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className={
          `text-[12px] font-medium ` +
          (isOvertime ? 'text-red-400' : 'text-on-surface-variant')
        }>
          {reserva.horaReserva}
          {isOvertime && <span className="ml-1">(+{timer.minutesOverdue}m)</span>}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCompletar}
            disabled={completar.isPending}
            className="w-7 h-7 rounded-lg bg-success/10 text-success flex items-center justify-center hover:bg-success/20 transition-colors disabled:opacity-50"
            title="Asistió"
            aria-label="Marcar como asistió"
          >
            <Check size={14} />
          </button>
          <button
            onClick={handleNoShow}
            disabled={isExpired || noShow.isPending}
            className="w-7 h-7 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="No asistió"
            aria-label="Marcar como no asistió"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
