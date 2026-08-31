import type { RestaurantePublic } from '../../types/bookingTypes'
import type { ReservaPublicStatus } from '../../services/bookingApi'
import { ReservationStatusCenter } from '../status/ReservationStatusCenter'

interface BookingSuccessPageProps {
  codigo: string
  accessToken?: string
  restaurante?: RestaurantePublic
  reserva?: ReservaPublicStatus
}

export function BookingSuccessPage({ codigo, accessToken, restaurante, reserva }: BookingSuccessPageProps) {
  return <ReservationStatusCenter codigo={codigo} accessToken={accessToken} restaurante={restaurante} initialStatus={reserva} justCreated />
}
