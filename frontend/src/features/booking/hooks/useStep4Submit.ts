import { useRef, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ApiError } from '@/shared/api/apiClient'
import { useBooking } from '../state/BookingContext'
import { useCrearReserva } from './useCrearReserva'
import { crearPreferenciaPago, type ReservaResponse } from '../services/bookingApi'
import { getSafeMercadoPagoCheckoutUrl } from '../utils/mercadoPagoCheckout'

export function useStep4Submit() {
  const navigate = useNavigate()
  const { slug: slugFromUrl } = useParams({ from: '/r/$slug/reservar' })
  const { sucursal, fecha, hora, partySize, cliente, metodoPago, acceptedTerms, setAcceptedTerms, setError, goToStep } = useBooking()
  const { mutateAsync: crearReserva, isPending: reservationPending } = useCrearReserva()
  const [preferencePending, setPreferencePending] = useState(false)
  const createdReservationRef = useRef<ReservaResponse | null>(null)
  const submissionInFlightRef = useRef(false)
  const submitting = reservationPending || preferencePending

  const canSubmit =
    !!sucursal &&
    !!fecha &&
    !!hora &&
    metodoPago === 'MP' &&
    acceptedTerms

  const handleSubmit = async () => {
    if (!canSubmit || !sucursal || !fecha || !hora || submissionInFlightRef.current) return
    submissionInFlightRef.current = true
    setError(null)

    try {
      let reserva = createdReservationRef.current

      if (!reserva) {
        reserva = await crearReserva({
          sucursalId: sucursal.id,
          fechaReserva: fecha,
          horaReserva: hora,
          cantPersonas: partySize,
          observaciones: cliente.observaciones,
          canalNotif: cliente.canalNotif || 'EMAIL',
          cliente: {
            nombre: cliente.nombre,
            email: cliente.email,
            telefono: cliente.telefono,
          },
        })
        createdReservationRef.current = reserva
      }

      if (reserva.estado === 'PENDIENTE_PAGO') {
        setPreferencePending(true)
        const pago = await crearPreferenciaPago(reserva.codigoReserva)
        const checkoutUrl = getSafeMercadoPagoCheckoutUrl(pago.linkPago)

        if (!checkoutUrl) {
          throw new Error('Invalid Mercado Pago checkout URL')
        }

        window.location.assign(checkoutUrl)
      } else {
        await navigate({
          to: '/r/$slug/reservar/exito/$codigo',
          params: { slug: slugFromUrl, codigo: reserva.codigoReserva },
        })
      }
    } catch (err: unknown) {
      const reserva = createdReservationRef.current

      if (reserva?.estado === 'PENDIENTE_PAGO') {
        setError(`Tu reserva ${reserva.codigoReserva} ya fue creada, pero no pudimos abrir el pago seguro. Reintentá para continuar sin crear otra reserva.`)
      } else if (reserva) {
        setError(`Tu reserva ${reserva.codigoReserva} ya fue creada, pero no pudimos mostrar la confirmación. Reintentá para continuar sin crear otra reserva.`)
      } else if ((err instanceof ApiError && err.status === 409) || (err instanceof Error && err.message.includes('No hay disponibilidad'))) {
        setError('Lo sentimos, ese horario se ocupó. Elegí otro.')
        goToStep(2)
      } else {
        setError('Error al crear la reserva. Intentá de nuevo.')
      }
    } finally {
      setPreferencePending(false)
      submissionInFlightRef.current = false
    }
  }

  return { acceptedTerms, setAcceptedTerms, canSubmit, handleSubmit, submitting }
}
