import type {
  RestaurantData,
  BrandSettings,
  Venue,
  WeekSchedule,
  Table,
  DayKey,
} from '@/features/setup/state/setupTypes'
import {
  DAY_KEYS,
  DIA_SEMANA_MAP,
  FONT_FAMILY_MAP,
  BORDER_STYLE_MAP,
  slugify,
} from '@/features/setup/state/setupTypes'
import type {
  CreateRestauranteDto,
  UpdateRestauranteDto,
  CreateSucursalDto,
  CreateHorarioDto,
  CreateMesaDto,
} from './setupApi'

export function mapRestaurantToCreateDto(
  restaurant: RestaurantData,
  usuarioAdminId: number,
): CreateRestauranteDto {
  return {
    usuarioAdminId,
    nombrePublico: restaurant.nombrePublico,
    slugPublico: restaurant.slug,
    razonSocial: restaurant.razonSocial || undefined,
    cuit: restaurant.cuit || undefined,
    slogan: restaurant.slogan || undefined,
    descripcion: restaurant.descripcion || undefined,
    tipoCocina: restaurant.tipoCocina || undefined,
    ciudadPrincipal: restaurant.ciudadPrincipal || undefined,
    emailComercial: restaurant.emailComercial || undefined,
  }
}

export function mapBrandToUpdateDto(brand: BrandSettings): UpdateRestauranteDto {
  return {
    colorPrimario: brand.primaryColor,
    colorAcento: brand.accentColor,
    tipografiaTitulos: FONT_FAMILY_MAP[brand.headingFont],
    tipografiaCuerpo: FONT_FAMILY_MAP[brand.bodyFont],
    estiloBordes: BORDER_STYLE_MAP[brand.borderRadius],
    instagramUrl: brand.instagram || undefined,
    facebookUrl: brand.facebook || undefined,
    sitioWeb: brand.website || undefined,
  }
}

export function mapRestaurantToUpdateDto(restaurant: RestaurantData): UpdateRestauranteDto {
  return {
    nombrePublico: restaurant.nombrePublico,
    slugPublico: restaurant.slug,
    razonSocial: restaurant.razonSocial || undefined,
    cuit: restaurant.cuit || undefined,
    slogan: restaurant.slogan || undefined,
    descripcion: restaurant.descripcion || undefined,
    tipoCocina: restaurant.tipoCocina || undefined,
    ciudadPrincipal: restaurant.ciudadPrincipal || undefined,
    emailComercial: restaurant.emailComercial || undefined,
  }
}

export function mapVenueToSucursalDto(
  venue: Venue,
  restauranteId: number,
): CreateSucursalDto {
  return {
    restauranteId,
    nombre: venue.name,
    slug: slugify(venue.name),
    direccion: venue.address || 'Sin dirección',
    telefono: venue.phone || undefined,
  }
}

export function mapWeekScheduleToHorarios(
  week: WeekSchedule,
  sucursalId: number,
): CreateHorarioDto[] {
  const horarios: CreateHorarioDto[] = []

  for (const day of DAY_KEYS) {
    const daySchedule = week[day as DayKey]
    if (!daySchedule.enabled) continue

    daySchedule.ranges.forEach((range, idx) => {
      horarios.push({
        diaSemana: DIA_SEMANA_MAP[day as DayKey],
        ordenTurno: idx + 1,
        horaApertura: range.open,
        horaCierre: range.close,
      })
    })
  }

  return horarios.map(h => ({ ...h, sucursalId }))
}

export function mapTablesToMesaDtos(
  tables: Table[],
  sucursalId: number,
): CreateMesaDto[] {
  return tables.map(table => ({
    sucursalId,
    nombre: table.name,
    capacidad: table.capacity,
  }))
}
