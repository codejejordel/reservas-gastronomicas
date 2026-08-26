import { useCallback, useEffect, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { CircleAlert, CheckCircle2, Clock3, CreditCard, RefreshCw, XCircle } from 'lucide-react'
import {
  crearPreferenciaPago,
  getReservaByCodigo,
  reconciliarRetornoPago,
  type PagoReturnResponse,
  type ReservaResponse,
} from '../../services/bookingApi'
import { getSafeMercadoPagoCheckoutUrl } from '../../utils/mercadoPagoCheckout'
import { getMercadoPagoPaymentId } from '../../utils/mercadoPagoReturn'

type ReturnHint = 'success' | 'pending' | 'failure'
type ViewState = 'approved' | 'pending' | 'rejected' | 'expired' | 'unverified'

interface PaymentReturnPageProps {
  codigo: string
  hint: ReturnHint
}

function resolveViewState(result: PagoReturnResponse | null, reserva: ReservaResponse | null): ViewState {
  if (reserva?.estado === 'CONFIRMADA' || result?.outcome === 'APPROVED') return 'approved'
  if (reserva?.estado === 'EXPIRADA') return 'expired'
  if (result?.outcome === 'REJECTED') return 'rejected'
  if (result?.outcome === 'EXPIRED') return 'expired'
  if (result?.outcome === 'PENDING') return 'pending'
  return 'unverified'
}

const content: Record<ViewState, { title: string; description: string }> = {
  approved: {
    title: '¡Reserva confirmada!',
    description: 'El pago fue verificado y tu reserva quedó confirmada.',
  },
  pending: {
    title: 'Tu pago está en proceso',
    description: 'La reserva todavía no está confirmada. Podés actualizar el estado en unos instantes.',
  },
  rejected: {
    title: 'No se pudo completar el pago',
    description: 'Tu reserva sigue pendiente y podés intentar pagar nuevamente de forma segura.',
  },
  expired: {
    title: 'El pago expiró',
    description: 'La reserva no fue confirmada. Contactá al restaurante para consultar disponibilidad.',
  },
  unverified: {
    title: 'No pudimos verificar el pago',
    description: 'No podemos confirmar la reserva todavía. Actualizá el estado antes de volver a pagar.',
  },
}

function StatusIcon({ state }: { state: ViewState }) {
  const className = 'h-10 w-10'
  if (state === 'approved') return <CheckCircle2 className={className} aria-hidden="true" />
  if (state === 'rejected' || state === 'expired') return <XCircle className={className} aria-hidden="true" />
  if (state === 'pending') return <Clock3 className={className} aria-hidden="true" />
  return <CircleAlert className={className} aria-hidden="true" />
}

export function PaymentReturnPage({ codigo, hint }: PaymentReturnPageProps) {
  const paymentId = getMercadoPagoPaymentId(window.location.search)
  const [result, setResult] = useState<PagoReturnResponse | null>(null)
  const [reserva, setReserva] = useState<ReservaResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [requestFailed, setRequestFailed] = useState(false)

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setRequestFailed(false)
    let reconciliationFailed = false

    try {
      setResult(await reconciliarRetornoPago(codigo, paymentId, signal))
    } catch {
      reconciliationFailed = true
      setResult(null)
    }

    try {
      setReserva(await getReservaByCodigo(codigo, signal))
    } catch {
      setReserva(null)
      setRequestFailed(true)
    } finally {
      if (reconciliationFailed) setRequestFailed(true)
      setLoading(false)
    }
  }, [codigo, paymentId])

  useEffect(() => {
    const controller = new AbortController()
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) return refresh(controller.signal)
    })
    return () => controller.abort()
  }, [refresh])

  const retryPayment = async () => {
    setRetrying(true)
    setRequestFailed(false)
    try {
      const pago = await crearPreferenciaPago(codigo)
      const checkoutUrl = getSafeMercadoPagoCheckoutUrl(pago.linkPago)
      if (!checkoutUrl) throw new Error('Invalid Mercado Pago checkout URL')
      window.location.assign(checkoutUrl)
    } catch {
      setRequestFailed(true)
      setRetrying(false)
    }
  }

  if (loading && !result && !reserva) {
    return (
      <main className="min-h-screen bg-[#faf8f5] px-4 py-12 flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <RefreshCw className="mx-auto mb-4 h-9 w-9 animate-spin text-primary" aria-hidden="true" />
          <p className="font-semibold text-on-surface">Verificando el estado del pago...</p>
          <p className="mt-1 text-sm text-on-surface-variant">No cierres esta ventana.</p>
        </div>
      </main>
    )
  }

  const state = resolveViewState(result, reserva)
  const copy = content[state]
  const canRetryPayment = state === 'rejected' && reserva?.estado === 'PENDIENTE_PAGO'

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 py-8 flex items-center justify-center">
      <section
        className="w-full max-w-xl rounded-3xl border border-outline-variant bg-white p-6 text-center shadow-sm sm:p-10"
        aria-live="polite"
        data-return-hint={hint}
      >
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: state === 'approved' ? 'var(--color-primary)' : state === 'pending' ? '#a16207' : '#b42318' }}
        >
          <StatusIcon state={state} />
        </div>

        <h1 className="text-2xl font-bold text-on-surface sm:text-3xl">{copy.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-on-surface-variant sm:text-base">{copy.description}</p>

        <div className="mx-auto my-6 max-w-sm rounded-2xl bg-surface-container-lowest px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Código de reserva</p>
          <p className="mt-1 break-all font-mono text-xl font-bold text-on-surface">{codigo}</p>
          <p className="mt-2 text-xs text-on-surface-variant">
            Estado: {reserva?.estado ?? result?.estadoReserva ?? 'sin confirmar'}
          </p>
        </div>

        {requestFailed && (
          <p className="mb-4 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container" role="alert">
            No pudimos actualizar el estado. Intentá nuevamente; tu reserva no fue confirmada por este mensaje.
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {canRetryPayment ? (
            <button
              type="button"
              onClick={() => void retryPayment()}
              disabled={retrying}
              className="min-h-11 flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex items-center justify-center gap-2">
                <CreditCard size={17} aria-hidden="true" />
                {retrying ? 'Abriendo pago seguro...' : 'Intentar pagar nuevamente'}
              </span>
            </button>
          ) : state !== 'approved' && state !== 'expired' ? (
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="min-h-11 flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex items-center justify-center gap-2">
                <RefreshCw size={17} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
                {loading ? 'Actualizando...' : 'Actualizar estado'}
              </span>
            </button>
          ) : null}
          <a href="/" className="min-h-11 flex-1 rounded-xl border border-outline px-4 py-3 text-sm font-semibold text-on-surface">
            Volver al inicio
          </a>
        </div>
      </section>
    </main>
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
