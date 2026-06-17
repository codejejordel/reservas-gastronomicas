export type DayAvailabilityStatus = 'available' | 'few-left' | 'full' | 'closed' | 'past'

export interface DayAvailability {
  date: string // ISO date YYYY-MM-DD
  status: DayAvailabilityStatus
}

export interface TimeSlot {
  time: string // HH:mm
  available: boolean
}

export interface RestaurantePublic {
  id: number
  nombrePublico: string
  slugPublico: string
  slug: string
  ciudadPrincipal: string
  fotoLocalUrl?: string
  colorPrimario: string
  colorAcento: string
  descripcion?: string
  slogan?: string
}

export interface SucursalPublic {
  id: number
  nombre: string
  slug: string
  direccion: string
  ciudad: string
  telefono?: string
}

export interface ClienteData {
  nombre: string
  email: string
  telefono: string
  observaciones: string
  canalNotif: 'EMAIL' | 'WHATSAPP' | null
}

export function makeDefaultClienteData(): ClienteData {
  return {
    nombre: '',
    email: '',
    telefono: '',
    observaciones: '',
    canalNotif: null,
  }
}
