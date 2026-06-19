import { apiFetch } from '@/shared/api/apiClient'
import type { ReservaDashboard, SucursalDashboard, RestauranteDashboard } from '../types'

export async function getReservasPorSucursal(
  sucursalId: number,
  fecha?: string,
  estado?: string,
): Promise<ReservaDashboard[]> {
  const params = new URLSearchParams()
  if (fecha) params.set('fecha', fecha)
  if (estado) params.set('estado', estado)
  const query = params.toString()
  return apiFetch(`/api/reserva/sucursal/${sucursalId}${query ? `?${query}` : ''}`)
}

export async function getSucursalesPorRestaurante(restauranteId: number): Promise<SucursalDashboard[]> {
  return apiFetch(`/api/sucursal/restaurante/${restauranteId}`)
}

export async function getRestaurantePorAdmin(usuarioAdminId: number): Promise<RestauranteDashboard | null> {
  const list = await apiFetch<RestauranteDashboard[]>('/api/restaurante')
  return list.find((r) => (r as unknown as { usuarioAdminId: number }).usuarioAdminId === usuarioAdminId) ?? null
}

export async function completarReserva(id: number): Promise<ReservaDashboard> {
  return apiFetch(`/api/reserva/${id}/completar`, { method: 'PATCH' })
}

export async function marcarNoShow(id: number): Promise<ReservaDashboard> {
  return apiFetch(`/api/reserva/${id}/no-show`, { method: 'PATCH' })
}
