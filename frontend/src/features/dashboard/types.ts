export interface ReservaDashboard {
  id: number
  codigoReserva: string
  sucursalId: number
  clienteNombre: string
  fechaReserva: string // YYYY-MM-DD
  horaReserva: string // HH:mm
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

export interface RestauranteDashboard {
  id: number
  nombrePublico: string
  slugPublico: string
  colorPrimario: string
  colorAcento: string
  fotoLocalUrl?: string
  logoUrl?: string
  ratingPromedioGlobal: number
  cantReseniasGlobal: number
}

export interface SucursalDashboard {
  id: number
  restauranteId: number
  nombre: string
  slug: string
  direccion: string
  ciudad?: string
  telefono?: string
  esPrincipal: boolean
  activa: boolean
}
