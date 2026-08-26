export type EstadoReserva = 'PENDIENTE_PAGO' | 'PENDIENTE_CONFIRMACION' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'NO_SHOW' | 'EXPIRADA'

export interface ReservaListItem {
  id: number
  codigoReserva: string
  sucursalId: number
  clienteNombre: string | null
  fechaReserva: string
  horaReserva: string
  cantPersonas: number
  estado: EstadoReserva
  observaciones: string | null
  nombreInvitado: string | null
  emailInvitado: string | null
  telefonoInvitado: string | null
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface ReservationDetail {
  id: number
  codigoReserva: string
  fechaReserva: string
  horaReserva: string
  cantPersonas: number
  estado: EstadoReserva
  contactoNombre: string | null
  contactoEmail: string | null
  contactoTelefono: string | null
  observaciones: string | null
  canalNotif: string | null
  fechaConfirmacion: string | null
  fechaCancelacion: string | null
  motivoCancelacion: string | null
  fechaCreacion: string
  fechaActualizacion: string
  asignacionesMesa: { id: number; mesaId: number; mesaNombre: string; mesaCapacidad: number }[]
}
