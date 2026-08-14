import { apiFetch } from '@/shared/api/apiClient'

export interface CreateRestauranteDto {
  usuarioAdminId: number
  nombrePublico: string
  slugPublico: string
  razonSocial?: string
  cuit?: string
  slogan?: string
  descripcion?: string
  tipoCocina?: string
  ciudadPrincipal?: string
  emailComercial?: string
  colorPrimario?: string
  colorAcento?: string
  tipografiaTitulos?: string
  tipografiaCuerpo?: string
  estiloBordes?: string
  instagramUrl?: string
  facebookUrl?: string
  sitioWeb?: string
}

export interface UpdateRestauranteDto {
  nombrePublico?: string
  slugPublico?: string
  razonSocial?: string
  cuit?: string
  slogan?: string
  descripcion?: string
  tipoCocina?: string
  ciudadPrincipal?: string
  emailComercial?: string
  colorPrimario?: string
  colorAcento?: string
  tipografiaTitulos?: string
  tipografiaCuerpo?: string
  estiloBordes?: string
  instagramUrl?: string
  facebookUrl?: string
  sitioWeb?: string
}

export interface RestauranteResponseDto {
  id: number
  usuarioAdminId: number
  nombrePublico: string
  slugPublico: string
  razonSocial: string | null
  cuit: string | null
  slogan: string | null
  colorPrimario: string | null
  colorAcento: string | null
  tipografiaTitulos: string | null
  tipografiaCuerpo: string | null
  estiloBordes: string | null
  activo: boolean
  publicado: boolean
}

export interface DisponibilidadDto {
  disponible: boolean
}

export interface CreateSucursalDto {
  restauranteId: number
  nombre: string
  slug: string
  direccion: string
  ciudad?: string
  telefono?: string
  email?: string
  capacidadMaxima?: number
}

export interface SucursalResponseDto {
  id: number
  restauranteId: number
  nombre: string
  slug: string
  esPrincipal: boolean
  activa: boolean
}

export interface CreateHorarioDto {
  diaSemana: string
  ordenTurno: number
  etiqueta?: string
  horaApertura: string
  horaCierre: string
}

export interface HorarioResponseDto {
  id: number
  sucursalId: number
  diaSemana: string
  horaApertura: string
  horaCierre: string
}

export interface CreateMesaDto {
  sucursalId: number
  nombre: string
  capacidad?: number
  ubicacion?: string
}

export interface MesaResponseDto {
  id: number
  sucursalId: number
  nombre: string
  capacidad: number
}

export const setupApi = {
  createRestaurante: (dto: CreateRestauranteDto): Promise<RestauranteResponseDto> =>
    apiFetch('/api/restaurante', { method: 'POST', body: JSON.stringify(dto) }),

  updateRestaurante: (id: number, dto: UpdateRestauranteDto): Promise<RestauranteResponseDto> =>
    apiFetch(`/api/restaurante/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),

  validarSlug: (valor: string, idRestaurante?: number): Promise<DisponibilidadDto> =>
    apiFetch(`/api/restaurante/validar/slug?valor=${encodeURIComponent(valor)}${idRestaurante ? `&idRestaurante=${idRestaurante}` : ''}`),

  validarNombre: (valor: string, idRestaurante?: number): Promise<DisponibilidadDto> =>
    apiFetch(`/api/restaurante/validar/nombre?valor=${encodeURIComponent(valor)}${idRestaurante ? `&idRestaurante=${idRestaurante}` : ''}`),

  validarCuit: (valor: string, excludeId?: number): Promise<DisponibilidadDto> =>
    apiFetch(`/api/restaurante/validar/cuit?valor=${encodeURIComponent(valor)}${excludeId ? `&excludeId=${excludeId}` : ''}`),

  createSucursal: (dto: CreateSucursalDto): Promise<SucursalResponseDto> =>
    apiFetch('/api/sucursal', { method: 'POST', body: JSON.stringify(dto) }),

  createHorario: (sucursalId: number, dto: CreateHorarioDto): Promise<HorarioResponseDto> =>
    apiFetch(`/api/sucursal/${sucursalId}/horario`, { method: 'POST', body: JSON.stringify(dto) }),

  createMesa: (dto: CreateMesaDto): Promise<MesaResponseDto> =>
    apiFetch('/api/mesa', { method: 'POST', body: JSON.stringify(dto) }),

  getOnboardingStatus: (): Promise<OnboardingStatusDto> =>
    apiFetch('/onboarding/status'),

  saveOnboardingProgress: (dto: OnboardingUpdateDto): Promise<OnboardingStatusDto> =>
    apiFetch('/onboarding', { method: 'PUT', body: JSON.stringify(dto) }),
}

export interface OnboardingStatusDto {
  usuarioId: number
  pasoActual: number
  completado: boolean
  datos: Record<string, unknown>
}

export interface OnboardingUpdateDto {
  pasoActual: number
  datos?: Record<string, unknown>
}
