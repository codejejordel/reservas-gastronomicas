import { useParams } from '@tanstack/react-router'
import { ReservationStatusCenter } from './ReservationStatusCenter'

export function ReservationStatusPage() {
  const { codigo } = useParams({ from: '/reserva/$codigo' })
  const accessToken = new URLSearchParams(window.location.search).get('token') ?? undefined
  return <ReservationStatusCenter codigo={codigo} accessToken={accessToken} />
}
