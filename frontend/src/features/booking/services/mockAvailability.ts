import type { DayAvailability, TimeSlot } from '../types/bookingTypes'

// TODO: reemplazar por endpoint real GET /sucursal/:id/disponibilidad

export function getDayAvailability(
  _sucursalId: number,
  year: number,
  month: number,
  _partySize: number
): DayAvailability[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result: DayAvailability[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const isoDate = date.toISOString().split('T')[0]

    if (date < today) {
      result.push({ date: isoDate, status: 'past' })
      continue
    }

    // Mock logic: días pares = disponible, impares = pocas mesas, múltiplos de 7 = completo
    if (day % 7 === 0) {
      result.push({ date: isoDate, status: 'full' })
    } else if (day % 2 === 0) {
      result.push({ date: isoDate, status: 'available' })
    } else {
      result.push({ date: isoDate, status: 'few-left' })
    }
  }

  return result
}

export function getTimeSlots(
  _sucursalId: number,
  _date: string,
  _partySize: number
): TimeSlot[] {
  // TODO: reemplazar por endpoint real

  // Mock: horarios de almuerzo y cena
  const slots: TimeSlot[] = []

  // Almuerzo: 12:00 - 15:00
  for (let h = 12; h <= 15; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 15 && m > 0) break
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      // Mock: algunos slots no disponibles
      const available = Math.random() > 0.3
      slots.push({ time, available })
    }
  }

  // Cena: 19:00 - 23:30
  for (let h = 19; h <= 23; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 23 && m > 30) break
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      const available = Math.random() > 0.2
      slots.push({ time, available })
    }
  }

  return slots
}
