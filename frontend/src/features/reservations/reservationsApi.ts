import { apiFetch } from '@/shared/api/apiClient'
import type { EstadoReserva, PageResponse, ReservationDetail, ReservaListItem } from './types'

export function searchReservations(sucursalId: number, filters: { from?: string; to?: string; statuses?: EstadoReserva[]; q?: string; page: number; size: number; sortDirection: 'ASC' | 'DESC' }) {
  const params = new URLSearchParams({ page: String(filters.page), size: String(filters.size), sortDirection: filters.sortDirection })
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.q) params.set('q', filters.q)
  filters.statuses?.forEach(status => params.append('statuses', status))
  return apiFetch<PageResponse<ReservaListItem>>(`/api/reserva/sucursal/${sucursalId}/buscar?${params}`)
}

export const getReservationDetail = (id: number) => apiFetch<ReservationDetail>(`/api/reserva/${id}/detalle`)
export const confirmReservation = (id: number) => apiFetch(`/api/reserva/${id}/confirmar`, { method: 'PATCH' })
export const completeReservation = (id: number) => apiFetch(`/api/reserva/${id}/completar`, { method: 'PATCH' })
export const noShowReservation = (id: number) => apiFetch(`/api/reserva/${id}/no-show`, { method: 'PATCH' })
export const cancelReservation = (id: number, motivo?: string) => apiFetch(`/api/reserva/${id}/cancelar`, { method: 'PATCH', body: JSON.stringify({ canceladaPor: 'RESTAURANTE', motivo }) })
