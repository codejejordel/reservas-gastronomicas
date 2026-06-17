import { apiFetch } from '@/shared/api/apiClient'
import type { RestaurantePublic, SucursalPublic } from '../types/bookingTypes'

// === Restaurant ===
export async function getRestauranteBySlug(slug: string): Promise<RestaurantePublic> {
  return apiFetch(`/api/restaurante/slug/${slug}`, { skipAuth: true })
}

// === Sucursal ===
export async function getSucursalesByRestaurante(restauranteId: number): Promise<SucursalPublic[]> {
  return apiFetch(`/api/sucursal/restaurante/${restauranteId}`, { skipAuth: true })
}

// === Disponibilidad ===
export interface DisponibilidadDia {
  fecha: string
  estado: 'available' | 'few-left' | 'full' | 'closed'
}

export interface HorarioSlot {
  hora: string
  disponible: boolean
}

export interface DisponibilidadResponse {
  dias: DisponibilidadDia[]
  horarios: Record<string, HorarioSlot[]>
}

export async function getDisponibilidad(
  sucursalId: number,
  desde: string,
  hasta: string,
  personas: number,
): Promise<DisponibilidadResponse> {
  const params = new URLSearchParams({ desde, hasta, personas: String(personas) })
  return apiFetch(`/api/sucursal/${sucursalId}/disponibilidad?${params.toString()}`, { skipAuth: true })
}

// === Reserva Pública ===
export interface ClienteInlineData {
  nombre: string
  email: string
  telefono?: string
}

export interface CrearReservaPublicaPayload {
  sucursalId: number
  fechaReserva: string
  horaReserva: string
  cantPersonas: number
  observaciones?: string
  canalNotif?: 'EMAIL' | 'WHATSAPP' | 'SMS'
  cliente: ClienteInlineData
}

export interface ReservaResponse {
  id: number
  codigoReserva: string
  sucursalId: number
  clienteId: number
  clienteNombre: string
  fechaReserva: string
  horaReserva: string
  cantPersonas: number
  estado: string
  observaciones?: string
  canalNotif?: string
  fechaConfirmacion?: string
  fechaCancelacion?: string
  motivoCancelacion?: string
  canceladaPor?: string
  fechaCreacion: string
}

export async function crearReservaPublica(payload: CrearReservaPublicaPayload): Promise<ReservaResponse> {
  return apiFetch('/api/reserva/public', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify(payload),
  })
}

export async function getReservaByCodigo(codigo: string): Promise<ReservaResponse> {
  return apiFetch(`/api/reserva/codigo/${codigo}`, { skipAuth: true })
}
