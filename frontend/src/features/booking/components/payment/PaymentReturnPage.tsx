import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useParams } from '@tanstack/react-router'
import { CircleAlert, CheckCircle2, Clock3, CreditCard, RefreshCw, XCircle } from 'lucide-react'
import {
  crearPreferenciaPago,
  getReservaPublicStatus,
  reconciliarRetornoPago,
  type PagoReturnResponse,
  type ReservaPublicStatus,
} from '../../services/bookingApi'
import { getSafeMercadoPagoCheckoutUrl } from '../../utils/mercadoPagoCheckout'
import { getMercadoPagoPaymentId } from '../../utils/mercadoPagoReturn'

type ReturnHint = 'success' | 'pending' | 'failure'
type ViewState = 'approved' | 'pending' | 'rejected' | 'expired' | 'cancelled' | 'completed' | 'no-show' | 'unverified'

interface PaymentReturnPageProps {
  codigo: string
  hint: ReturnHint
}

function resolveViewState(result: PagoReturnResponse | null, reserva: ReservaPublicStatus | null): ViewState {
  const reservationState = reserva?.estado ?? result?.estadoReserva
  if (reservationState === 'CANCELADA') return 'cancelled'
  if (reservationState === 'COMPLETADA') return 'completed'
  if (reservationState === 'NO_SHOW') return 'no-show'
  if (reservationState === 'EXPIRADA') return 'expired'
  if (reservationState === 'CONFIRMADA') return 'approved'
  if (reserva?.estadoPago === 'RECHAZADO') return 'rejected'
  if (reserva?.estadoPago === 'PENDIENTE') return 'pending'
  if (result?.outcome === 'APPROVED') return 'approved'
  if (result?.outcome === 'REJECTED') return 'rejected'
  if (result?.outcome === 'EXPIRED') return 'expired'
  if (result?.outcome === 'PENDING') return 'pending'
  return 'unverified'
}

const content: Record<ViewState, { eyebrow: string; title: string; description: string }> = {
  approved: {
    eyebrow: 'Pago aprobado',
    title: '¡Reserva confirmada!',
    description: 'El pago fue verificado y tu reserva quedó confirmada.',
  },
  pending: {
    eyebrow: 'Pago en revisión',
    title: 'Tu pago está en proceso',
    description: 'La reserva todavía no está confirmada. Podés actualizar el estado en unos instantes.',
  },
  rejected: {
    eyebrow: 'Pago rechazado',
    title: 'No se pudo completar el pago',
    description: 'Tu reserva sigue pendiente y podés intentar pagar nuevamente de forma segura.',
  },
  expired: {
    eyebrow: 'Pago vencido',
    title: 'El pago expiró',
    description: 'La reserva no fue confirmada. Contactá al restaurante para consultar disponibilidad.',
  },
  cancelled: {
    eyebrow: 'Reserva cancelada',
    title: 'Esta reserva fue cancelada',
    description: 'Si necesitás información sobre el pago o un posible reintegro, contactá al restaurante.',
  },
  completed: {
    eyebrow: 'Reserva completada',
    title: 'La visita ya fue completada',
    description: 'Esta reserva figura como completada. No necesitás realizar ninguna acción de pago.',
  },
  'no-show': {
    eyebrow: 'Ausencia registrada',
    title: 'La reserva figura como no asistida',
    description: 'El restaurante registró una ausencia para esta reserva. Contactalo si necesitás revisar el estado.',
  },
  unverified: {
    eyebrow: 'Verificación pendiente',
    title: 'No pudimos verificar el pago',
    description: 'No podemos confirmar la reserva todavía. Actualizá el estado antes de volver a pagar.',
  },
}

const reservationStatusLabels: Record<string, string> = {
  PENDIENTE_PAGO: 'Pendiente de pago',
  PENDIENTE_CONFIRMACION: 'Pendiente de confirmación',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  COMPLETADA: 'Completada',
  NO_SHOW: 'Ausente',
  EXPIRADA: 'Expirada',
}

const primaryActionClassName =
  'inline-flex min-h-12 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-center text-sm font-bold leading-5 text-on-primary transition-colors hover:bg-primary/90 active:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest disabled:cursor-not-allowed disabled:opacity-50'

const secondaryActionClassName =
  'inline-flex min-h-12 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-xl border border-outline bg-surface-container-lowest px-5 py-3 text-center text-sm font-bold leading-5 text-on-surface transition-colors hover:bg-surface-container-low active:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest'

function PaymentStatusShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-surface px-4 py-6 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-12 h-72 w-72 rounded-full bg-tertiary/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-2xl items-center sm:min-h-[calc(100dvh-5rem)]">
        <section className="min-w-0 w-full overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-xl shadow-on-surface/5">
          <div className="flex items-center gap-3 border-b border-outline-variant px-5 py-4 sm:px-8">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary" aria-hidden="true">
              <CreditCard className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-serif text-sm font-bold text-on-surface">Turnify</p>
              <p className="text-xs text-on-surface-variant">Estado del pago de tu reserva</p>
            </div>
          </div>
          {children}
        </section>
      </div>
    </main>
  )
}

function StatusIcon({ state }: { state: ViewState }) {
  const className = 'h-9 w-9 sm:h-10 sm:w-10'
  if (state === 'approved' || state === 'completed') return <CheckCircle2 className={className} aria-hidden="true" />
  if (state === 'rejected' || state === 'expired' || state === 'cancelled') return <XCircle className={className} aria-hidden="true" />
  if (state === 'pending') return <Clock3 className={className} aria-hidden="true" />
  return <CircleAlert className={className} aria-hidden="true" />
}

function getStatusTone(state: ViewState) {
  if (state === 'approved' || state === 'completed') return 'bg-success-container text-on-success-container'
  if (state === 'pending' || state === 'no-show') return 'bg-warning-container text-on-warning-container'
  if (state === 'rejected' || state === 'expired' || state === 'cancelled') return 'bg-error-container text-on-error-container'
  return 'bg-surface-container-high text-on-surface'
}

export function PaymentReturnPage({ codigo, hint }: PaymentReturnPageProps) {
  const paymentId = getMercadoPagoPaymentId(window.location.search)
  const accessToken = new URLSearchParams(window.location.search).get('token')
  const [result, setResult] = useState<PagoReturnResponse | null>(null)
  const [reserva, setReserva] = useState<ReservaPublicStatus | null>(null)
  const [loading, setLoading] = useState(Boolean(accessToken))
  const [retrying, setRetrying] = useState(false)
  const [requestFailed, setRequestFailed] = useState(false)

  const refresh = useCallback(async (signal?: AbortSignal) => {
    if (!accessToken) {
      setRequestFailed(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setRequestFailed(false)
    let reconciliationFailed = false

    try {
      setResult(await reconciliarRetornoPago(codigo, accessToken, paymentId, signal))
    } catch {
      reconciliationFailed = true
      setResult(null)
    }

    try {
      setReserva(await getReservaPublicStatus(codigo, accessToken, signal))
    } catch {
      setReserva(null)
      setRequestFailed(true)
    } finally {
      if (reconciliationFailed) setRequestFailed(true)
      setLoading(false)
    }
  }, [accessToken, codigo, paymentId])

  useEffect(() => {
    const controller = new AbortController()
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) return refresh(controller.signal)
    })
    return () => controller.abort()
  }, [refresh])

  const retryPayment = async () => {
    if (!accessToken) return
    setRetrying(true)
    setRequestFailed(false)
    try {
      const pago = await crearPreferenciaPago(codigo, accessToken)
      const checkoutUrl = getSafeMercadoPagoCheckoutUrl(pago.checkoutUrl)
      if (!checkoutUrl) throw new Error('Invalid Mercado Pago checkout URL')
      window.location.assign(checkoutUrl)
    } catch {
      setRequestFailed(true)
      setRetrying(false)
    }
  }

  if (loading && !result && !reserva) {
    return (
      <PaymentStatusShell>
        <div className="flex min-h-96 flex-col items-center justify-center px-5 py-12 text-center sm:px-10" role="status" aria-live="polite">
          <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
            <RefreshCw className="h-8 w-8 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          </span>
          <h1 className="font-serif text-2xl font-bold leading-[1.3] text-on-surface sm:text-3xl">Verificando tu pago</h1>
          <p className="mt-3 w-full max-w-[24rem] text-base leading-7 text-on-surface-variant">
            Estamos consultando el estado seguro de la operación. Esto puede demorar unos instantes.
          </p>
        </div>
      </PaymentStatusShell>
    )
  }

  const state = resolveViewState(result, reserva)
  const copy = content[state]
  const isTerminalState = ['approved', 'expired', 'cancelled', 'completed', 'no-show'].includes(state)
  const canRetryPayment = !isTerminalState && reserva?.puedeContinuarPago === true
  const reservationState = reserva?.estado ?? result?.estadoReserva
  const reservationStateLabel = reservationState
    ? reservationStatusLabels[reservationState] ?? 'Estado no disponible'
    : 'Sin confirmar'

  return (
    <PaymentStatusShell>
      <div
        className="min-w-0 px-5 py-8 text-center sm:px-10 sm:py-10"
        aria-busy={loading || retrying}
        aria-live="polite"
        data-return-hint={hint}
        data-view-state={state}
      >
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${getStatusTone(state)}`}>
          <StatusIcon state={state} />
        </div>

        <p className="mt-5 text-sm font-bold uppercase tracking-widest text-on-surface-variant">{copy.eyebrow}</p>
        <h1 className="mt-2 font-serif text-2xl font-bold leading-[1.3] text-on-surface sm:text-3xl">{copy.title}</h1>
        <p className="mx-auto mt-3 w-full max-w-[28rem] text-base leading-7 text-on-surface-variant">{copy.description}</p>

        <div className="mx-auto my-7 w-full max-w-[28rem] rounded-2xl border border-outline-variant bg-surface-container-low p-5 text-left sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Código de reserva</p>
          <p className="mt-2 max-w-full font-mono text-xl font-bold leading-[1.4] text-on-surface [overflow-wrap:anywhere] sm:text-2xl">{codigo}</p>
          <div className="mt-4 flex flex-col items-start gap-1 border-t border-outline-variant pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span className="text-sm text-on-surface-variant">Estado de la reserva</span>
            <span className="text-left text-sm font-bold leading-5 text-on-surface sm:text-right">{reservationStateLabel}</span>
          </div>
        </div>

        {requestFailed && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-error/30 bg-error-container px-4 py-3 text-left text-sm leading-6 text-on-error-container" role="alert">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>{accessToken ? 'No pudimos actualizar el estado. Intentá nuevamente; tu reserva no fue confirmada por este mensaje.' : 'Este enlace no incluye el token privado necesario. Usá el enlace completo que guardaste al crear la reserva.'}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {canRetryPayment ? (
            <button type="button" onClick={() => void retryPayment()} disabled={retrying} className={primaryActionClassName}>
              {retrying ? (
                <RefreshCw className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <CreditCard className="h-5 w-5" aria-hidden="true" />
              )}
              {retrying ? 'Abriendo pago seguro...' : reserva?.estadoPago === 'RECHAZADO' ? 'Intentar pagar nuevamente' : 'Continuar pago'}
            </button>
          ) : !isTerminalState ? (
            <button type="button" onClick={() => void refresh()} disabled={loading} className={primaryActionClassName}>
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />
              {loading ? 'Actualizando...' : 'Actualizar estado'}
            </button>
          ) : null}
          <a href="/" className={secondaryActionClassName}>Volver al inicio</a>
        </div>
      </div>
    </PaymentStatusShell>
  )
}

export function PaymentSuccessfulReturn() {
  const { codigo } = useParams({ from: '/reserva/$codigo/pago-exitoso' })
  return <PaymentReturnPage codigo={codigo} hint="success" />
}

export function PaymentPendingReturn() {
  const { codigo } = useParams({ from: '/reserva/$codigo/pago-pendiente' })
  return <PaymentReturnPage codigo={codigo} hint="pending" />
}

export function PaymentFailedReturn() {
  const { codigo } = useParams({ from: '/reserva/$codigo/pago-fallido' })
  return <PaymentReturnPage codigo={codigo} hint="failure" />
}
