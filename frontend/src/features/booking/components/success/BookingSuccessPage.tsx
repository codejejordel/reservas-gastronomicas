import { motion } from 'motion/react'
import { CheckCircle2, Calendar, Clock, Users, MapPin, Download } from 'lucide-react'
import type { RestaurantePublic } from '../../types/bookingTypes'
import type { ReservaResponse } from '../../services/bookingApi'

interface BookingSuccessPageProps {
  codigo: string
  restaurante?: RestaurantePublic
  reserva?: ReservaResponse
}

function formatFecha(f: string): string {
  const d = new Date(f + 'T00:00:00')
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return `${dias[d.getDay()]}, ${d.getDate()} ${meses[d.getMonth()]}`
}

export function BookingSuccessPage({ codigo, restaurante, reserva }: BookingSuccessPageProps) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.32, 0, 0.24, 1] }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-3xl border border-outline-variant p-8 sm:p-12 text-center">
          {/* Icono de éxito */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <CheckCircle2 size={48} style={{ color: 'var(--color-on-primary)' }} />
          </motion.div>

          {/* Título */}
          <h1
            style={{ fontFamily: "'Sora', sans-serif" }}
            className="text-3xl sm:text-4xl font-bold text-on-surface mb-3"
          >
            ¡Reserva confirmada!
          </h1>
          <p className="text-base text-on-surface-variant mb-8">
            Te enviamos un email con todos los detalles.
          </p>

          {/* Código de reserva */}
          <div
            className="rounded-2xl px-6 py-4 mb-8 inline-block"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              Código de reserva
            </p>
            <p className="text-2xl font-bold font-mono" style={{ color: 'var(--color-primary)' }}>
              {codigo}
            </p>
          </div>

          {/* Resumen */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 mb-8 text-left">
            <h2 className="text-sm font-bold uppercase tracking-wide text-on-surface-variant mb-4">
              Resumen de tu reserva
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                  <MapPin size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Restaurante</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {restaurante?.nombrePublico ?? '—'}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {restaurante?.ciudadPrincipal ?? '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                  <Users size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Comensales</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {reserva ? `${reserva.cantPersonas} ${reserva.cantPersonas === 1 ? 'Adulto' : 'Adultos'}` : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                  <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Fecha</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {reserva?.fechaReserva ? formatFecha(reserva.fechaReserva) : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                  <Clock size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Hora</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {reserva?.horaReserva ?? '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all border-2"
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
            >
              <Download size={16} />
              Agregar a calendario
            </motion.button>
            <motion.a
              href="/"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              Volver al inicio
            </motion.a>
          </div>

          {/* Nota */}
          <p className="text-xs text-on-surface-variant mt-6">
            Recordá llegar con{' '}
            <span style={{ color: 'var(--color-primary)' }} className="font-semibold">
              15 minutos de anticipación
            </span>
            . ¡Te esperamos!
          </p>
        </div>
      </motion.div>
    </div>
  )
}
