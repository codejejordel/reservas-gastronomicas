import { DAY_KEYS, type DayKey, type WeekSchedule } from '@/features/setup/state/setupTypes'
import { settingsApi, type HorarioSettings } from './settingsApi'

const DAY_TO_API: Record<DayKey, string> = {
  mon: 'MONDAY', tue: 'TUESDAY', wed: 'WEDNESDAY', thu: 'THURSDAY',
  fri: 'FRIDAY', sat: 'SATURDAY', sun: 'SUNDAY',
}

export async function syncSchedules(branchId: number, previous: HorarioSettings[], draft: WeekSchedule) {
  const previousIds = new Set(previous.map(item => item.id))
  const retainedIds = new Set<number>()
  const creates: Promise<unknown>[] = []
  const updates: Promise<unknown>[] = []

  for (const day of DAY_KEYS) {
    if (!draft[day].enabled) continue
    draft[day].ranges.forEach((range, index) => {
      const payload = {
        ordenTurno: index + 1,
        etiqueta: null,
        horaApertura: range.open,
        horaCierre: range.close,
      }
      if (previousIds.has(range.id)) {
        retainedIds.add(range.id)
        updates.push(settingsApi.updateSchedule(branchId, range.id, payload))
      } else {
        creates.push(settingsApi.createSchedule(branchId, { diaSemana: DAY_TO_API[day], ...payload }))
      }
    })
  }

  await Promise.all([...updates, ...creates])
  await Promise.all(previous.filter(item => !retainedIds.has(item.id)).map(item => settingsApi.deleteSchedule(branchId, item.id)))
}
