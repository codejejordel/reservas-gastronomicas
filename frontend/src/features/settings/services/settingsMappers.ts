import { DAY_KEYS, type DayKey, type WeekSchedule, makeDefaultWeekSchedule } from '@/features/setup/state/setupTypes'
import type { HorarioSettings } from './settingsApi'

const DAY_TO_API: Record<DayKey, string> = {
  mon: 'MONDAY', tue: 'TUESDAY', wed: 'WEDNESDAY', thu: 'THURSDAY',
  fri: 'FRIDAY', sat: 'SATURDAY', sun: 'SUNDAY',
}

export const DEFAULT_TIME_RANGE = { open: '09:00', close: '18:00' }

export function toWeekSchedule(items: HorarioSettings[]): WeekSchedule {
  const week = makeDefaultWeekSchedule()
  DAY_KEYS.forEach(day => {
    week[day] = { enabled: false, ranges: [{ id: -(DAY_KEYS.indexOf(day) + 1), ...DEFAULT_TIME_RANGE }] }
  })

  items.filter(item => item.activo).forEach(item => {
    const day = (Object.entries(DAY_TO_API).find(([, value]) => value === item.diaSemana)?.[0] as DayKey | undefined)
    if (!day) return
    if (!week[day].enabled) week[day].ranges = []
    week[day].enabled = true
    week[day].ranges.push({ id: item.id, open: item.horaApertura, close: item.horaCierre })
  })

  return week
}

export function fromWeekSchedule(week: WeekSchedule): Omit<HorarioSettings, 'id' | 'sucursalId' | 'activo'>[] {
  return DAY_KEYS.flatMap(day => week[day].enabled
    ? week[day].ranges.map((range, index) => ({
        diaSemana: DAY_TO_API[day], ordenTurno: index + 1, etiqueta: null,
        horaApertura: range.open, horaCierre: range.close,
      }))
    : [])
}
