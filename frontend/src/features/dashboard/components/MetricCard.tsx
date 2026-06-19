import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Calendar, Users, Star, CheckCircle, Clock, ArrowUpRight } from 'lucide-react'
import type { ReservaDashboard } from '../types'

const iconMap = {
  calendar: Calendar,
  users: Users,
  star: Star,
  check: CheckCircle,
  clock: Clock,
}

interface MetricCardProps {
  label: string
  icon: keyof typeof iconMap
  value?: string
  description: string
  queryKey?: string
  sucursalId?: number | null
  formatter?: (data: ReservaDashboard[] | undefined) => string
}

export function MetricCard({
  label,
  icon,
  value: staticValue,
  description,
  queryKey,
  sucursalId,
  formatter,
}: MetricCardProps) {
  const qc = useQueryClient()
  const Icon = iconMap[icon]

  const displayValue = useMemo(() => {
    if (staticValue !== undefined) return staticValue
    if (!queryKey || !formatter) return '—'
    const data = qc.getQueryData<ReservaDashboard[]>([queryKey, sucursalId])
    return formatter(data)
  }, [staticValue, queryKey, sucursalId, formatter, qc])

  return (
    <div className="bg-surface-container rounded-[20px] p-5 border border-outline-variant/50 hover:border-outline-variant transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-surface-container-high flex items-center justify-center">
            <Icon size={16} className="text-primary" />
          </div>
          <span className="text-[13px] font-semibold text-on-surface">{label}</span>
        </div>
        <button className="text-on-surface-dim hover:text-on-surface-variant transition-colors">
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Value */}
      <p className="text-[32px] font-bold text-on-surface leading-tight tracking-tight">
        {displayValue}
      </p>
      <p className="text-[11px] text-on-surface-variant mt-1">{description}</p>
    </div>
  )
}
