import { useMemo } from 'react'
import { useReservasMes } from '../hooks/useReservasMes'
import type { ReservaDashboard } from '../types'

interface HeatmapCardProps {
  sucursalId: number | null
}

const FRANJAS = ['12-14', '14-17', '17-20', '20-23', '23-02']
const DIAS_LABEL = Array.from({ length: 31 }, (_, i) => String(i + 1))

export function HeatmapCard({ sucursalId }: HeatmapCardProps) {
  const { data: reservas } = useReservasMes(sucursalId)

  const heatmap = useMemo(() => {
    // grid[franjaIndex][diaIndex] = count
    const grid: number[][] = Array.from({ length: FRANJAS.length }, () =>
      Array(31).fill(0)
    )

    reservas?.forEach((r: ReservaDashboard) => {
      const day = Number(r.fechaReserva.slice(8, 10)) - 1
      if (day < 0 || day >= 31) return

      const [h] = r.horaReserva.split(':').map(Number)
      let franja = 0
      if (h >= 12 && h < 14) franja = 0
      else if (h >= 14 && h < 17) franja = 1
      else if (h >= 17 && h < 20) franja = 2
      else if (h >= 20 && h < 23) franja = 3
      else franja = 4

      grid[franja][day] += r.cantPersonas
    })

    const max = Math.max(1, ...grid.flat())
    return { grid, max }
  }, [reservas])

  const getIntensity = (count: number) => {
    const ratio = count / heatmap.max
    if (ratio === 0) return 'bg-transparent'
    if (ratio < 0.25) return 'bg-primary/20'
    if (ratio < 0.5) return 'bg-primary/40'
    if (ratio < 0.75) return 'bg-primary/70'
    return 'bg-primary'
  }

  return (
    <div className="bg-surface-container rounded-[20px] p-5 border border-outline-variant/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-on-surface">Actividad del mes</h3>
        <div className="flex items-center gap-3">
          {[
            { label: 'Low', cls: 'bg-primary/20' },
            { label: 'Medium', cls: 'bg-primary/40' },
            { label: 'High', cls: 'bg-primary/70' },
            { label: 'Best', cls: 'bg-primary' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${item.cls}`} />
              <span className="text-[10px] text-on-surface-variant">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Day numbers header */}
          <div className="flex items-center">
            <div className="w-12 shrink-0" />
            <div className="flex gap-[3px]">
              {DIAS_LABEL.slice(0, 30).map((d) => (
                <div key={d} className="w-[22px] text-center text-[9px] text-on-surface-dim">
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          {FRANJAS.map((franja, fi) => (
            <div key={franja} className="flex items-center mt-[3px]">
              <div className="w-12 shrink-0 text-[10px] font-medium text-on-surface-variant pr-2 text-right">
                {franja}
              </div>
              <div className="flex gap-[3px]">
                {DIAS_LABEL.slice(0, 30).map((_, di) => {
                  const count = heatmap.grid[fi][di]
                  return (
                    <div
                      key={di}
                      className={`w-[22px] h-[22px] rounded-md ${getIntensity(count)} transition-colors`}
                      title={`${franja}h — Día ${di + 1}: ${count} comensales`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
