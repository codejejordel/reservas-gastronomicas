import { apiFetch } from '@/shared/api/apiClient'

export interface RestauranteSettings {
  id: number
  usuarioAdminId: number
  nombrePublico: string
  slugPublico: string
  razonSocial: string | null
  cuit: string | null
  slogan: string | null
  descripcion: string | null
  tipoCocina: string | null
  ciudadPrincipal: string | null
  logoUrl: string | null
  fotoLocalUrl: string | null
  colorPrimario: string | null
  colorAcento: string | null
  tipografiaTitulos: string | null
  tipografiaCuerpo: string | null
  estiloBordes: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  sitioWeb: string | null
  emailComercial: string | null
}

export type RestauranteUpdate = Partial<Omit<RestauranteSettings, 'id' | 'usuarioAdminId'>>

export interface SucursalSettings {
  id: number
  restauranteId: number
  nombre: string
  slug: string
  esPrincipal: boolean
  direccion: string
  ciudad: string | null
  provincia: string | null
  codigoPostal: string | null
  pais: string | null
  telefono: string | null
  email: string | null
  capacidadMaxima: number | null
  zonaHoraria: string | null
  activa: boolean
}

export type SucursalInput = Partial<Omit<SucursalSettings, 'id' | 'restauranteId' | 'esPrincipal' | 'activa'>>

export interface HorarioSettings {
  id: number
  sucursalId: number
  diaSemana: string
  ordenTurno: number
  etiqueta: string | null
  horaApertura: string
  horaCierre: string
  activo: boolean
}

export interface MesaSettings {
  id: number
  sucursalId: number
  nombre: string
  ubicacion: string | null
  capacidad: number
  estado: 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA' | 'FUERA_DE_SERVICIO'
}

export interface ConfiguracionSucursal {
  cobrarSenia: boolean
  montoSenia: number
  toleranciaMinutos: number
  habilitarListaEspera: boolean
  confirmacionAutomatica: boolean
  minutosRecordatorio: number
  maxPersonasPorReserva: number
  minPersonasPorReserva: number
  diasAnticipacionMaxima: number
  duracionAlmuerzoMinutos: number
  duracionCenaMinutos: number
  minutosLockPago: number
  horasCancelacionLibre: number
  umbralNoShowsBloqueo: number
}

export const settingsApi = {
  getRestaurant: (id: number) => apiFetch<RestauranteSettings>(`/api/restaurante/${id}`),
  updateRestaurant: (id: number, data: RestauranteUpdate) => apiFetch<RestauranteSettings>(`/api/restaurante/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  validateSlug: (slug: string, id: number) => apiFetch<{ disponible: boolean }>(`/api/restaurante/validar/slug?valor=${encodeURIComponent(slug)}&idRestaurante=${id}`),
  uploadRestaurantImage: async (id: number, tipo: 'LOGO' | 'BANNER', file: File) => {
    const body = new FormData()
    body.append('archivo', file)
    return apiFetch<RestauranteSettings>(`/api/restaurante/${id}/imagen?tipo=${tipo}`, { method: 'POST', body })
  },
  deleteRestaurantImage: (id: number, tipo: 'LOGO' | 'BANNER') => apiFetch<RestauranteSettings>(`/api/restaurante/${id}/imagen?tipo=${tipo}`, { method: 'DELETE' }),

  getBranches: (restaurantId: number) => apiFetch<SucursalSettings[]>(`/api/sucursal/restaurante/${restaurantId}`),
  createBranch: (data: SucursalInput & { restauranteId: number; nombre: string; slug: string; direccion: string }) => apiFetch<SucursalSettings>('/api/sucursal', { method: 'POST', body: JSON.stringify(data) }),
  updateBranch: (id: number, data: SucursalInput) => apiFetch<SucursalSettings>(`/api/sucursal/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBranch: (id: number) => apiFetch<void>(`/api/sucursal/${id}`, { method: 'DELETE' }),
  makePrincipal: (id: number) => apiFetch<SucursalSettings>(`/api/sucursal/${id}/principal`, { method: 'PATCH' }),

  getSchedules: (branchId: number) => apiFetch<HorarioSettings[]>(`/api/sucursal/${branchId}/horario`),
  createSchedule: (branchId: number, data: Omit<HorarioSettings, 'id' | 'sucursalId' | 'activo'>) => apiFetch<HorarioSettings>(`/api/sucursal/${branchId}/horario`, { method: 'POST', body: JSON.stringify(data) }),
  updateSchedule: (branchId: number, id: number, data: Partial<HorarioSettings>) => apiFetch<HorarioSettings>(`/api/sucursal/${branchId}/horario/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSchedule: (branchId: number, id: number) => apiFetch<void>(`/api/sucursal/${branchId}/horario/${id}`, { method: 'DELETE' }),

  getTables: (branchId: number) => apiFetch<MesaSettings[]>(`/api/mesa/sucursal/${branchId}`),
  createTable: (data: Pick<MesaSettings, 'sucursalId' | 'nombre' | 'ubicacion' | 'capacidad'>) => apiFetch<MesaSettings>('/api/mesa', { method: 'POST', body: JSON.stringify(data) }),
  createTables: (data: Pick<MesaSettings, 'sucursalId' | 'nombre' | 'ubicacion' | 'capacidad'>[]) => apiFetch<MesaSettings[]>('/api/mesa/bulk', { method: 'POST', body: JSON.stringify(data) }),
  updateTable: (id: number, data: Partial<Pick<MesaSettings, 'nombre' | 'ubicacion' | 'capacidad'>>) => apiFetch<MesaSettings>(`/api/mesa/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateTableState: (id: number, estado: MesaSettings['estado']) => apiFetch<MesaSettings>(`/api/mesa/${id}/estado?estado=${estado}`, { method: 'PATCH' }),
  deleteTable: (id: number) => apiFetch<void>(`/api/mesa/${id}`, { method: 'DELETE' }),

  getReservationRules: (branchId: number) => apiFetch<ConfiguracionSucursal>(`/api/sucursal/${branchId}/configuracion`),
  updateReservationRules: (branchId: number, data: Partial<ConfiguracionSucursal>) => apiFetch<ConfiguracionSucursal>(`/api/sucursal/${branchId}/configuracion`, { method: 'PUT', body: JSON.stringify(data) }),
}
