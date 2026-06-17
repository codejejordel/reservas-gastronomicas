import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarDayCell } from './CalendarDayCell'
import { useDisponibilidad } from '../../hooks/useDisponibilidad'
import { toIsoDate, isPast } from '../../lib/dateUtils'
import type { DayAvailability } from '../../types/bookingTypes'

interface DualMonthCalendarProps {
  sucursalId: number
  partySize: number
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

const DIAS_SEMANA = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export function DualMonthCalendar({ sucursalId, partySize, selectedDate, onSelectDate }: DualMonthCalendarProps) {
  const [baseMonth, setBaseMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const months = useMemo(() => {
    const first = { year: baseMonth.year, month: baseMonth.month }
    const second = {
      year: baseMonth.month === 11 ? baseMonth.year + 1 : baseMonth.year,
      month: (baseMonth.month + 1) % 12,
    }
    return [first, second]
  }, [baseMonth])

  // Calcular rango de fechas para la consulta
  const desde = useMemo(() => {
    const d = new Date(months[0].year, months[0].month, 1)
    return toIsoDate(d)
  }, [months])

  const hasta = useMemo(() => {
    const d = new Date(months[1].year, months[1].month + 1, 0)
    return toIsoDate(d)
  }, [months])

  const { data: disponibilidad, isFetching, isLoading } = useDisponibilidad({
    sucursalId,
    desde,
    hasta,
    personas: partySize,
  })

  const availability = useMemo(() => {
    const map = new Map<string, DayAvailability>()
    if (!disponibilidad) return map

    disponibilidad.dias.forEach(d => {
      map.set(d.fecha, {
        date: d.fecha,
        status: d.estado as DayAvailability['status'],
      })
    })
    return map
  }, [disponibilidad])

  const goToPrevMonth = () => {
    setBaseMonth(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 }
      return { year: prev.year, month: prev.month - 1 }
    })
  }

  const goToNextMonth = () => {
    setBaseMonth(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 }
      return { year: prev.year, month: prev.month + 1 }
    })
  }

  const renderMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    let startDayOfWeek = firstDay.getDay() - 1
    if (startDayOfWeek === -1) startDayOfWeek = 6

    const cells: React.ReactElement[] = []
    
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push(<div key={`empty-${i}`} />)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isoDate = toIsoDate(date)
      const dayData = availability.get(isoDate)
      const isToday = date.getTime() === today.getTime()
      
      // Determinar status: si es pasado, marcar como 'past' aunque tenga disponibilidad
      let status = dayData?.status || 'past'
      if (isPast(date) && status !== 'past') {
        status = 'past'
      }

      // Skeleton durante carga inicial
      if (isLoading) {
        cells.push(
          <div key={day} className="w-full aspect-square rounded-lg bg-surface-container animate-pulse" />
        )
      } else {
        cells.push(
          <CalendarDayCell
            key={day}
            day={day}
            date={isoDate}
            status={status}
            isSelected={selectedDate === isoDate}
            isToday={isToday}
            onClick={() => {
              if (status !== 'past' && status !== 'full' && status !== 'closed') {
                onSelectDate(isoDate)
              }
            }}
          />
        )
      }
    }

    return cells
  }

  return (
    <div className="space-y-6">
      {/* Desktop: 2 meses lado a lado */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-8">
        {months.map(({ year, month }, idx) => (
          <div key={`${year}-${month}`} className="bg-white rounded-2xl border border-outline-variant p-5">
            <div className="flex items-center justify-between mb-4">
              {idx === 0 && (
                <button
                  type="button"
                  onClick={goToPrevMonth}
                  className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              <h3 className="font-bold text-base text-on-surface flex-1 text-center">
                {MESES[month]} {year}
              </h3>
              {idx === 1 && (
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              )}
              {idx === 0 && <div className="w-8" />}
              {idx === 1 && <div className="w-8" />}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-on-surface-variant py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderMonth(year, month)}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: 1 mes con flechas */}
      <div className="lg:hidden bg-white rounded-2xl border border-outline-variant p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-bold text-base text-on-surface">
            {MESES[months[0].month]} {months[0].year}
          </h3>
          <button
            type="button"
            onClick={goToNextMonth}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-on-surface-variant py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {renderMonth(months[0].year, months[0].month)}
        </div>
      </div>

      {/* Indicador de actualización */}
      {isFetching && (
        <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Actualizando disponibilidad...
        </div>
      )}

      {/* Banner si no hay días disponibles */}
      {!isLoading && disponibilidad && disponibilidad.dias.every(d => d.estado === 'closed' || d.estado === 'full') && (
        <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 text-center">
          <p className="text-sm text-on-surface-variant">Esta sucursal no tiene horarios configurados en este rango de fechas.</p>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-on-surface-variant">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-error" />
          <span className="text-on-surface-variant">Últimas mesas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-lg bg-error-container/30 border border-error" />
          <span className="text-on-surface-variant">Completo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-lg bg-surface-container-low" />
          <span className="text-on-surface-variant">Cerrado</span>
        </div>
      </div>
    </div>
  )
}
