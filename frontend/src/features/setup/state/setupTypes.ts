export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
}

export interface TimeRange {
  id: number
  open: string
  close: string
}

export interface DaySchedule {
  enabled: boolean
  ranges: TimeRange[]
}

export type WeekSchedule = Record<DayKey, DaySchedule>

export interface Venue {
  id: number
  name: string
  address: string
  phone: string
}

export interface ScheduleState {
  global: WeekSchedule
  overrides: Record<number, WeekSchedule | null>
}

export interface Table {
  id: number
  name: string
  capacity: number
}

export interface TablesState {
  global: Table[]
  overrides: Record<number, Table[] | null>
}

export function makeDefaultTables(): Table[] {
  return []
}

export interface RestaurantData {
  nombrePublico: string
  razonSocial: string
  cuit: string
  tipoCocina: string
  ciudadPrincipal: string
  descripcion: string
  slogan: string
  emailComercial: string
  slug: string
}

export function makeDefaultRestaurant(): RestaurantData {
  return {
    nombrePublico: '',
    razonSocial: '',
    cuit: '',
    tipoCocina: '',
    ciudadPrincipal: '',
    descripcion: '',
    slogan: '',
    emailComercial: '',
    slug: '',
  }
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export type FontFamily = 'sora' | 'playfair' | 'inter' | 'dm-sans'
export type BorderRadiusStyle = 'minimal' | 'soft' | 'rounded'

export interface BrandSettings {
  logoDataUrl: string | null
  bannerDataUrl: string | null
  primaryColor: string
  accentColor: string
  headingFont: FontFamily
  bodyFont: FontFamily
  borderRadius: BorderRadiusStyle
  instagram: string
  facebook: string
  website: string
}

export function makeDefaultBrand(): BrandSettings {
  return {
    logoDataUrl: null,
    bannerDataUrl: null,
    primaryColor: '#005759',
    accentColor: '#07a7a9',
    headingFont: 'playfair',
    bodyFont: 'inter',
    borderRadius: 'soft',
    instagram: '',
    facebook: '',
    website: '',
  }
}

export function makeDefaultDaySchedule(): DaySchedule {
  return { enabled: true, ranges: [{ id: 1, open: '09:00', close: '18:00' }] }
}

export function makeDefaultWeekSchedule(): WeekSchedule {
  return Object.fromEntries(
    DAY_KEYS.map(k => [k, makeDefaultDaySchedule()])
  ) as WeekSchedule
}
