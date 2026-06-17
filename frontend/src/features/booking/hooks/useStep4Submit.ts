import { useNavigate, useParams } from '@tanstack/react-router'
import { useBooking } from '../state/BookingContext'
import { useCrearReserva } from './useCrearReserva'

export function useStep4Submit() {
  const navigate = useNavigate()
  const { slug: slugFromUrl } = useParams({ from: '/r/$slug/reservar' })
  const { sucursal, fecha, hora, partySize, cliente, metodoPago, acceptedTerms, setAcceptedTerms, setError, goToStep } = useBooking()
  const { mutateAsync: crearReserva, isPending: submitting } = useCrearReserva()

  const canSubmit =
    !!sucursal &&
    !!fecha &&
    !!hora &&
    metodoPago === 'MP' &&
    acceptedTerms

  const handleSubmit = async () => {
    if (!canSubmit || !sucursal || !fecha || !hora) return
    setError(null)

    try {
      const reserva = await crearReserva({
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

      navigate({
        to: '/r/$slug/reservar/exito/$codigo',
        params: { slug: slugFromUrl, codigo: reserva.codigoReserva },
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('409') || message.includes('No hay disponibilidad')) {
        setError('Lo sentimos, ese horario se ocupó. Elegí otro.')
        goToStep(2)
      } else {
        setError('Error al crear la reserva. Intentá de nuevo.')
      }
    }
  }

  return { acceptedTerms, setAcceptedTerms, canSubmit, handleSubmit, submitting }
}
