import { useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RefreshCw, Plus } from 'lucide-react'
import { useReservasHoy } from '../hooks/useReservasHoy'
import { ReservaItem } from './ReservaItem'
import type { ReservaDashboard } from '../types'

interface ReservasCardProps {
  sucursalId: number | null
}

export function ReservasCard({ sucursalId }: ReservasCardProps) {
  const { data, isLoading, isFetching } = useReservasHoy(sucursalId)
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set())

  const handleRemove = useCallback((id: number) => {
    setRemovedIds((prev) => new Set(prev).add(id))
  }, [])

  const visibleReservas = useMemo(() => {
    if (!data) return []
    const now = new Date()
    const nowMin = now.getHours() * 60 + now.getMinutes()

    return data
      .filter((r: ReservaDashboard) => !removedIds.has(r.id))
      .filter((r: ReservaDashboard) => {
        const [h, m] = r.horaReserva.split(':').map(Number)
        const resMin = h * 60 + m
        // Mostrar reservas pasadas hasta 5 min de tolerancia
        return resMin >= nowMin - 5
      })
      .sort((a: ReservaDashboard, b: ReservaDashboard) =>
        a.horaReserva.localeCompare(b.horaReserva)
      )
  }, [data, removedIds])

  return (
    <div className="bg-surface-container rounded-[20px] p-5 border border-outline-variant/50 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-on-surface">Próximas reservas</h3>
        <div className="flex items-center gap-2">
          <button
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-dim hover:text-on-surface transition-colors ${isFetching ? 'animate-spin' : ''}`}
            title="Actualizar"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className={`flex flex-1 ${visibleReservas.length === 0 ? 'items-center' : 'items-start'} justify-center min-h-0 overflow-y-auto mx-1 px-1`}>
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : visibleReservas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
                <Plus size={20} className="text-on-surface-dim rotate-45" />
              </div>
              <p className="text-[13px] font-medium text-on-surface-variant">No hay reservas</p>
              <p className="text-[11px] text-on-surface-dim mt-0.5">Próximas reservas aparecerán aquí</p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              {visibleReservas.map((reserva: ReservaDashboard) => (
                <ReservaItem
                  key={reserva.id}
                  reserva={reserva}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Nueva reserva button */}
      <button
        className="mt-4 w-full py-2.5 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, #9d7cff 0%, #ff6b9d 100%)',
        }}
      >
        <Plus size={16} />
        Nueva reserva
      </button>
    </div>
  )
}
