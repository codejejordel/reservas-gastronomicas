import type { Venue, ScheduleState, TablesState, BrandSettings, DayKey } from '@/features/setup/state/setupTypes'
import { DAY_KEYS } from '@/features/setup/state/setupTypes'

const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue',
  fri: 'Vie', sat: 'Sáb', sun: 'Dom',
}

export function summarizeVenues(venues: Venue[]): { count: number; names: string[] } {
  return {
    count: venues.length,
    names: venues.map((v, i) => v.name || `Local ${i + 1}`),
  }
}

export function summarizeSchedule(schedule: ScheduleState): { lines: string[]; overrideCount: number } {
  const global = schedule.global
  const overrideCount = Object.values(schedule.overrides).filter(Boolean).length

  // Group days with identical range strings
  const dayStr = (d: DayKey) => {
    const { enabled, ranges } = global[d]
    if (!enabled) return 'cerrado'
    return ranges.map(r => `${r.open}–${r.close}`).join(', ')
  }

  const groups: { days: string[]; str: string }[] = []
  for (const day of DAY_KEYS) {
    const str = dayStr(day)
    const existing = groups.find(g => g.str === str)
    if (existing) existing.days.push(DAY_LABELS[day])
    else groups.push({ days: [DAY_LABELS[day]], str })
  }

  const lines = groups.map(g => `${g.days.join(', ')}: ${g.str}`)
  return { lines, overrideCount }
}

export function summarizeTables(tables: TablesState): { global: number; totalCapacity: number; overrideCount: number } {
  const globalCount = tables.global.length
  const totalCapacity = tables.global.reduce((acc, t) => acc + t.capacity, 0)
  const overrideCount = Object.values(tables.overrides).filter(Boolean).length
  return { global: globalCount, totalCapacity, overrideCount }
}

export function summarizeBrand(brand: BrandSettings): {
  displayName: string
  city: string
  slug: string
  primaryColor: string
  headingFont: string
  hasLogo: boolean
  hasBanner: boolean
} {
  const fontLabels: Record<string, string> = {
    playfair: 'Playfair', sora: 'Sora', inter: 'Inter', 'dm-sans': 'DM Sans',
  }
  return {
    displayName: brand.displayName || 'Sin nombre',
    city: brand.city,
    slug: brand.slug,
    primaryColor: brand.primaryColor,
    headingFont: fontLabels[brand.headingFont] ?? brand.headingFont,
    hasLogo: !!brand.logoDataUrl,
    hasBanner: !!brand.bannerDataUrl,
  }
}

export function isSetupComplete(
  venues: Venue[],
  brand: BrandSettings,
): { ok: boolean; warnings: string[] } {
  const warnings: string[] = []
  if (venues.length === 0) warnings.push('No tenés ningún local configurado.')
  if (!brand.displayName.trim()) warnings.push('El nombre público de tu agenda está vacío.')
  if (!brand.slug.trim()) warnings.push('La URL pública de tu agenda está vacía.')
  return { ok: warnings.length === 0, warnings }
}
