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

// === Cotización de reserva ===
export interface CotizacionReserva {
  cargoServicioUnitario: number
  cargoServicioTotal: number
  cobraSenia: boolean
  montoSenia: number
  totalAPagarAhora: number
  horasCancelacionLibre: number
  toleranciaMinutos: number
}

export async function getCotizacionReserva(
  sucursalId: number,
  personas: number,
  signal?: AbortSignal,
): Promise<CotizacionReserva> {
  const params = new URLSearchParams({ personas: String(personas) })
  return apiFetch(`/api/sucursal/${sucursalId}/reserva/cotizacion?${params.toString()}`, {
    skipAuth: true,
    signal,
  })
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
  codigoReserva: string
  fechaReserva: string
  horaReserva: string
  cantPersonas: number
  estado: string
  accessToken: string
  fechaLimitePago: string | null
}

export type EstadoPago = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'REEMBOLSADO' | 'EXPIRADO'

export interface PagoResponse {
  checkoutUrl: string
  fechaExpiracion: string | null
}

export interface ReservaPublicStatus {
  codigoReserva: string
  estado: string
  fechaReserva: string
  horaReserva: string
  cantPersonas: number
  estadoPago: EstadoPago | null
  puedeContinuarPago: boolean
  fechaLimitePago: string | null
}

export type PagoReturnOutcome = 'APPROVED' | 'PENDING' | 'REJECTED' | 'EXPIRED' | 'UNVERIFIED'

export interface PagoReturnResponse {
  codigoReserva: string
  estadoReserva: string
  estadoPago: EstadoPago | null
  providerStatus: string | null
  verified: boolean
  outcome: PagoReturnOutcome
}

export async function crearReservaPublica(payload: CrearReservaPublicaPayload): Promise<ReservaResponse> {
  return apiFetch('/api/reserva/public', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify(payload),
  })
}

function accessHeaders(accessToken: string): HeadersInit {
  return { 'X-Reservation-Token': accessToken }
}

export async function crearPreferenciaPago(codigoReserva: string, accessToken: string): Promise<PagoResponse> {
  return apiFetch(`/api/reserva/public/${encodeURIComponent(codigoReserva)}/pago/preference`, {
    method: 'POST',
    skipAuth: true,
    headers: accessHeaders(accessToken),
  })
}

export async function reconciliarRetornoPago(
  codigoReserva: string,
  accessToken: string,
  paymentId: string | null,
  signal?: AbortSignal,
): Promise<PagoReturnResponse> {
  return apiFetch(`/api/reserva/public/${encodeURIComponent(codigoReserva)}/pago/return`, {
    method: 'POST',
    skipAuth: true,
    signal,
    headers: accessHeaders(accessToken),
    body: JSON.stringify({ paymentId }),
  })
}

export async function getReservaPublicStatus(
  codigo: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<ReservaPublicStatus> {
  return apiFetch(`/api/reserva/public/${encodeURIComponent(codigo)}/status`, {
    skipAuth: true,
    signal,
    headers: accessHeaders(accessToken),
  })
}
