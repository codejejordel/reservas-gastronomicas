import { useMemo } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import * as Select from '@radix-ui/react-select'
import { useSucursalSeleccionadaStore } from '../state/sucursalSeleccionadaStore'
import type { SucursalDashboard } from '../types'

interface SucursalSelectorProps {
  sucursales: SucursalDashboard[] | undefined
  isLoading: boolean
}

export function SucursalSelector({ sucursales, isLoading }: SucursalSelectorProps) {
  const sucursalId = useSucursalSeleccionadaStore((s) => s.sucursalId)
  const setSucursalId = useSucursalSeleccionadaStore((s) => s.setSucursalId)

  const seleccionada = useMemo(
    () => sucursales?.find((s) => s.id === sucursalId),
    [sucursales, sucursalId]
  )

  if (isLoading) {
    return (
      <div className="h-9 w-40 bg-surface-container-high rounded-xl animate-pulse" />
    )
  }

  if (!sucursales?.length) return null

  return (
    <Select.Root
      value={String(sucursalId ?? '')}
      onValueChange={(v) => setSucursalId(Number(v))}
    >
      <Select.Trigger
        className="inline-flex items-center gap-2 h-9 pl-3 pr-2 rounded-xl bg-surface-container-high border border-outline-variant text-[13px] font-medium text-on-surface hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label="Seleccionar sucursal"
      >
        <MapPin size={14} className="text-on-surface-variant shrink-0" />
        <span className="truncate max-w-[120px]">
          {seleccionada?.nombre ?? 'Sucursal'}
        </span>
        <ChevronDown size={14} className="text-on-surface-variant shrink-0" />
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="z-50 min-w-[200px] bg-surface-container rounded-xl border border-outline-variant shadow-lg overflow-hidden"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport className="p-1.5">
            {sucursales.map((s) => (
              <Select.Item
                key={s.id}
                value={String(s.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-on-surface cursor-pointer hover:bg-surface-container-high focus:bg-surface-container-high focus:outline-none data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary"
              >
                <Select.ItemText>{s.nombre}</Select.ItemText>
                {s.esPrincipal && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    Principal
                  </span>
                )}
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
