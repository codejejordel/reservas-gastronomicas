import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useReservasMes } from '../hooks/useReservasMes'
import { COBERTURA_MAX } from '../constants'
import type { ReservaDashboard } from '../types'

interface CalendarCardProps {
  sucursalId: number | null
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function CalendarCard({ sucursalId }: CalendarCardProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const { data: reservas } = useReservasMes(sucursalId)

  const countsByDay = useMemo(() => {
    const map = new Map<string, number>()
    reservas?.forEach((r: ReservaDashboard) => {
      const key = r.fechaReserva
      map.set(key, (map.get(key) ?? 0) + 1)
    })
    return map
  }, [reservas])

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const startOffset = (firstDay.getDay() + 6) % 7 // Lunes = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const prevDays = new Date(year, month, 0).getDate()

    const cells: { day: number; type: 'prev' | 'current' | 'next'; dateStr: string }[] = []

    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({ day: prevDays - i, type: 'prev', dateStr: '' })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = i.toString().padStart(2, '0')
      const m = (month + 1).toString().padStart(2, '0')
      cells.push({ day: i, type: 'current', dateStr: `${year}-${m}-${d}` })
    }
    const remaining = (7 - (cells.length % 7)) % 7
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, type: 'next', dateStr: '' })
    }

    return cells
  }, [year, month])

  const isToday = (dateStr: string) => {
    const t = new Date().toISOString().slice(0, 10)
    return dateStr === t
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="bg-surface-container rounded-[20px] p-4 border border-outline-variant/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-on-surface">
          {MONTHS[month]} {year}
        </h3>
        <div className="flex items-center gap-0.5">
          <button onClick={prevMonth} className="w-6 h-6 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={nextMonth} className="w-6 h-6 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-on-surface-dim py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((cell, idx) => {
          const count = cell.type === 'current' ? (countsByDay.get(cell.dateStr) ?? 0) : 0
          const todayActive = cell.type === 'current' && isToday(cell.dateStr)
          const covered = count >= COBERTURA_MAX

          return (
            <div key={idx} className="flex flex-col items-center justify-center py-1 relative">
              <div
                className={
                  `w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-medium transition-colors ` +
                  (todayActive
                    ? 'bg-primary text-on-primary'
                    : covered && cell.type === 'current'
                      ? 'bg-red-500/10 text-red-400'
                      : cell.type === 'current'
                        ? 'text-on-surface hover:bg-surface-container-high'
                        : 'text-on-surface-dim opacity-40')
                }
              >
                {cell.day}
              </div>
              {count > 0 && cell.type === 'current' && (
                <div className="flex flex-col items-center mt-0.5 gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  {count > 1 && (
                    <span className="text-[8px] font-semibold text-primary leading-none">
                      {count > 50 ? '+50' : count}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
