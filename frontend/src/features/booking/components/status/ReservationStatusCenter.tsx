import { useEffect, useState, type ReactNode } from 'react'
import { Calendar, CheckCircle2, Clock3, Copy, CreditCard, RefreshCw, Users, XCircle } from 'lucide-react'
import type { RestaurantePublic } from '../../types/bookingTypes'
import {
  crearPreferenciaPago,
  getReservaPublicStatus,
  type ReservaPublicStatus,
} from '../../services/bookingApi'
import { getSafeMercadoPagoCheckoutUrl } from '../../utils/mercadoPagoCheckout'

interface ReservationStatusCenterProps {
  codigo: string
  accessToken?: string
  restaurante?: RestaurantePublic
  initialStatus?: ReservaPublicStatus
  justCreated?: boolean
}

const actionClass = 'inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-surface px-4 py-6 sm:px-6 sm:py-10">
      <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-xl shadow-on-surface/5">
        <div className="flex items-center gap-3 border-b border-outline-variant px-5 py-4 sm:px-8">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary" aria-hidden="true"><CreditCard className="h-5 w-5" /></span>
          <div><p className="font-serif text-sm font-bold text-on-surface">Turnify</p><p className="text-xs text-on-surface-variant">Centro privado de tu reserva</p></div>
        </div>
        {children}
      </section>
    </main>
  )
}

function statusCopy(status: ReservaPublicStatus) {
  if (status.estado === 'CONFIRMADA') return { title: 'Reserva confirmada', detail: 'Tu reserva está confirmada. Te esperamos en el horario acordado.', tone: 'success' }
  if (status.estado === 'COMPLETADA') return { title: 'Visita completada', detail: 'La visita de esta reserva quedó registrada como completada.', tone: 'success' }
  if (status.estado === 'NO_SHOW') return { title: 'Ausencia registrada', detail: 'El restaurante registró que la reserva no se presentó.', tone: 'error' }
  if (status.estado === 'EXPIRADA') return { title: 'El plazo de pago venció', detail: 'La reserva ya no mantiene disponibilidad. Consultá nuevamente antes de reservar.', tone: 'error' }
  if (status.estado === 'CANCELADA') return { title: 'Reserva cancelada', detail: 'Esta reserva ya no está activa.', tone: 'error' }
  if (status.estado === 'PENDIENTE_CONFIRMACION') return { title: 'Pendiente de confirmación', detail: 'El restaurante todavía debe confirmar tu reserva.', tone: 'pending' }
  if (status.estadoPago === 'RECHAZADO') return { title: 'El pago fue rechazado', detail: 'Podés volver a intentarlo mientras el plazo siga vigente.', tone: 'error' }
  if (status.estadoPago === 'PENDIENTE') return { title: 'Pago pendiente', detail: 'La reserva todavía no está confirmada. Actualizá el estado antes de volver a pagar.', tone: 'pending' }
  return { title: 'Reserva pendiente de pago', detail: 'Completá el pago antes del vencimiento para confirmar tu reserva.', tone: 'pending' }
}

function deadlineCopy(deadline: string | null, now: number) {
  if (!deadline) return null
  const date = new Date(`${deadline}Z`)
  const formattedTime = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  if (now === 0) return `Podés pagar hasta las ${formattedTime}.`
  const remainingMinutes = Math.max(0, Math.ceil((date.getTime() - now) / 60000))
  return `Podés pagar hasta las ${formattedTime}. Quedan aproximadamente ${remainingMinutes} min.`
}

export function ReservationStatusCenter({ codigo, accessToken, restaurante, initialStatus, justCreated = false }: ReservationStatusCenterProps) {
  const [status, setStatus] = useState<ReservaPublicStatus | null>(initialStatus ?? null)
  const [loading, setLoading] = useState(!initialStatus && !!accessToken)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState(!accessToken ? 'Este enlace privado no incluye un token válido.' : '')
  const [copied, setCopied] = useState(false)
  const [now, setNow] = useState<number | null>(null)

  const refresh = async () => {
    if (!accessToken) return
    setLoading(true)
    setError('')
    try { setStatus(await getReservaPublicStatus(codigo, accessToken)) }
    catch { setError('No pudimos acceder a esta reserva. Verificá que el enlace privado esté completo.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (initialStatus || !accessToken) return
    const controller = new AbortController()
    void getReservaPublicStatus(codigo, accessToken, controller.signal)
      .then(setStatus)
      .catch(() => setError('No pudimos acceder a esta reserva. Verificá que el enlace privado esté completo.'))
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [codigo, accessToken, initialStatus])
  useEffect(() => {
    const update = () => setNow(Date.now())
    const timeoutId = window.setTimeout(update, 0)
    const intervalId = window.setInterval(update, 30000)
    return () => { window.clearTimeout(timeoutId); window.clearInterval(intervalId) }
  }, [])

  const pay = async () => {
    if (!accessToken) return
    setPaying(true)
    setError('')
    try {
      const preference = await crearPreferenciaPago(codigo, accessToken)
      const checkoutUrl = getSafeMercadoPagoCheckoutUrl(preference.checkoutUrl)
      if (!checkoutUrl) throw new Error('Invalid checkout URL')
      window.location.assign(checkoutUrl)
    } catch { setError('No pudimos abrir el pago seguro. Actualizá el estado e intentá nuevamente.') ; setPaying(false) }
  }

  const statusUrl = accessToken ? `${window.location.origin}/reserva/${encodeURIComponent(codigo)}?${new URLSearchParams({ token: accessToken })}` : '#'
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(statusUrl); setCopied(true) }
    catch { setError('No pudimos copiar el enlace. Guardá esta página en tus marcadores.') }
  }

  if (loading && !status) return <Shell><div className="flex min-h-96 flex-col items-center justify-center p-8 text-center" role="status"><RefreshCw className="h-8 w-8 animate-spin text-primary motion-reduce:animate-none" /><p className="mt-4 font-bold">Cargando el estado seguro...</p></div></Shell>
  if (!status) return <Shell><div className="min-h-80 p-8 text-center"><XCircle className="mx-auto h-14 w-14 text-error" /><h1 className="mt-4 font-serif text-2xl font-bold">No pudimos abrir la reserva</h1><p className="mx-auto mt-3 max-w-[28rem] leading-7 text-on-surface-variant">{error}</p></div></Shell>

  const copy = statusCopy(status)
  const deadline = deadlineCopy(status.fechaLimitePago, now ?? 0)
  const Icon = copy.tone === 'success' ? CheckCircle2 : copy.tone === 'error' ? XCircle : Clock3

  return (
    <Shell>
      <div className="px-5 py-8 text-center sm:px-10 sm:py-10" aria-live="polite" aria-busy={loading || paying}>
        <Icon className={`mx-auto h-16 w-16 ${copy.tone === 'success' ? 'text-success' : copy.tone === 'error' ? 'text-error' : 'text-primary'}`} aria-hidden="true" />
        <p className="mt-5 text-sm font-bold uppercase tracking-widest text-on-surface-variant">{justCreated ? 'Reserva creada' : 'Estado actualizado'}</p>
        <h1 className="mt-2 font-serif text-2xl font-bold leading-tight text-on-surface sm:text-3xl">{copy.title}</h1>
        <p className="mx-auto mt-3 max-w-[28rem] leading-7 text-on-surface-variant">{copy.detail}</p>
        {deadline && status.estado === 'PENDIENTE_PAGO' && <p className="mx-auto mt-3 max-w-[28rem] rounded-xl bg-warning-container px-4 py-3 text-sm font-semibold leading-6 text-on-warning-container">{deadline}</p>}

        <div className="mx-auto my-7 max-w-[28rem] rounded-2xl border border-outline-variant bg-surface-container-low p-5 text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Código de reserva</p><p className="mt-1 font-mono text-xl font-bold [overflow-wrap:anywhere]">{codigo}</p>
          {restaurante && <p className="mt-4 border-t border-outline-variant pt-4 text-sm font-semibold">{restaurante.nombrePublico}</p>}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-outline-variant pt-4 sm:grid-cols-3">
            <span className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-primary" />{status.fechaReserva}</span>
            <span className="flex items-center gap-2 text-sm"><Clock3 className="h-4 w-4 text-primary" />{status.horaReserva}</span>
            <span className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-primary" />{status.cantPersonas} personas</span>
          </div>
        </div>

        {error && <p className="mb-4 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container" role="alert">{error}</p>}
        <div className="flex flex-col gap-3 sm:flex-row">
          {status.puedeContinuarPago && <button type="button" onClick={() => void pay()} disabled={paying} className={`${actionClass} bg-primary text-on-primary`}>{paying ? <RefreshCw className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}{status.estadoPago ? 'Continuar pago' : 'Pagar ahora'}</button>}
          {justCreated && status.puedeContinuarPago ? <a href={statusUrl} className={`${actionClass} border border-outline text-on-surface`}>Pagar más tarde</a> : <button type="button" onClick={() => void refresh()} disabled={loading} className={`${actionClass} border border-outline text-on-surface`}><RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />Actualizar estado</button>}
        </div>
        <div className="mt-5 rounded-xl border border-outline-variant bg-surface-container-low p-4 text-left">
          <p className="text-sm font-bold">Guardá tu enlace privado</p><p className="mt-1 text-sm leading-6 text-on-surface-variant">No enviamos mensajes desde esta pantalla. Copiá el enlace o guardá esta página en tus marcadores para volver.</p>
          <button type="button" onClick={() => void copyLink()} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Copy className="h-4 w-4" />{copied ? 'Enlace copiado' : 'Copiar enlace privado'}</button>
        </div>
      </div>
    </Shell>
  )
}
