import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSucursalSeleccionadaStore } from '@/features/dashboard/state/sucursalSeleccionadaStore'
import { slugify, type Table, type WeekSchedule } from '@/features/setup/state/setupTypes'
import { fromWeekSchedule } from '../services/settingsMappers'
import { settingsApi, type ConfiguracionSucursal, type SucursalSettings } from '../services/settingsApi'

interface CreateVenueInput {
  restaurantId: number
  branches: SucursalSettings[]
  nombre: string
  direccion: string
  telefono: string
  ciudad: string
  capacidadMaxima: number | null
  schedule: WeekSchedule
  tables: Table[]
  rules: ConfiguracionSucursal | null
}

function uniqueSlug(nombre: string, branches: SucursalSettings[]) {
  const base = slugify(nombre) || 'local'
  const used = new Set(branches.map(branch => branch.slug))
  let candidate = base
  let suffix = 2
  while (used.has(candidate)) candidate = `${base}-${suffix++}`
  return candidate
}

export function useCreateVenue() {
  const queryClient = useQueryClient()
  const setSucursalId = useSucursalSeleccionadaStore((state) => state.setSucursalId)

  return useMutation({
    mutationFn: async (input: CreateVenueInput) => {
      const branch = await settingsApi.createBranch({
        restauranteId: input.restaurantId,
        nombre: input.nombre.trim(),
        slug: uniqueSlug(input.nombre, input.branches),
        direccion: input.direccion.trim() || 'Sin dirección',
        telefono: input.telefono.trim() || undefined,
        ciudad: input.ciudad.trim() || undefined,
        capacidadMaxima: input.capacidadMaxima ?? undefined,
      })

      const errors: string[] = []
      try {
        if (input.rules) await settingsApi.updateReservationRules(branch.id, input.rules)
      } catch {
        errors.push('las reglas de reserva')
      }
      try {
        await Promise.all(fromWeekSchedule(input.schedule).map(schedule => settingsApi.createSchedule(branch.id, schedule)))
      } catch {
        errors.push('los horarios')
      }
      try {
        if (input.tables.length) {
          await settingsApi.createTables(input.tables.map(table => ({
            sucursalId: branch.id, nombre: table.name, capacidad: table.capacity, ubicacion: null,
          })))
        }
      } catch {
        errors.push('las mesas')
      }

      return { branch, errors }
    },
    onSuccess: ({ branch }) => {
      setSucursalId(branch.id)
      void queryClient.invalidateQueries({ queryKey: ['sucursales'] })
      void queryClient.invalidateQueries({ queryKey: ['settings-branches'] })
      void queryClient.invalidateQueries({ queryKey: ['settings-schedules'] })
      void queryClient.invalidateQueries({ queryKey: ['settings-tables'] })
      void queryClient.invalidateQueries({ queryKey: ['settings-rules'] })
    },
  })
}
