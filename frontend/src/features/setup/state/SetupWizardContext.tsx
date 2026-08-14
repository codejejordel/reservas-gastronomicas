import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import type { Venue, ScheduleState, WeekSchedule, DayKey, TimeRange, TablesState, Table, BrandSettings, RestaurantData, PersistedIds } from './setupTypes'
import { makeDefaultWeekSchedule, makeDefaultTables, makeDefaultBrand, makeDefaultRestaurant, makeDefaultPersistedIds, slugify } from './setupTypes'
import { clearWizardProgress } from './setupPersistence'
import { useOnboardingSync, progressDataToState } from '@/features/setup/hooks/useOnboardingSync'
import { useAuthStore } from '@/features/auth/store/authStore'

interface SetupWizardState {
  currentStep: number
  restaurant: RestaurantData
  venues: Venue[]
  schedule: ScheduleState
  tables: TablesState
  brand: BrandSettings
  ids: PersistedIds
}

interface SetupWizardActions {
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  // Venues
  addVenue: (venue: Omit<Venue, 'id'>) => void
  updateVenue: (id: number, patch: Partial<Omit<Venue, 'id'>>) => void
  removeVenue: (id: number) => void
  // Schedule — global
  setDayEnabled: (scope: 'global' | number, day: DayKey, enabled: boolean) => void
  setTimeRange: (scope: 'global' | number, day: DayKey, rangeId: number, field: 'open' | 'close', value: string) => void
  addTimeRange: (scope: 'global' | number, day: DayKey) => void
  removeTimeRange: (scope: 'global' | number, day: DayKey, rangeId: number) => void
  copyDay: (scope: 'global' | number, fromDay: DayKey, toDays: DayKey[]) => void
  // Schedule — overrides
  enableOverride: (venueId: number) => void
  disableOverride: (venueId: number) => void
  // Tables
  addTable: (scope: 'global' | number, table: Omit<Table, 'id'>) => void
  addManyTables: (scope: 'global' | number, opts: { count: number; prefix: string; startNumber: number; capacity: number }) => void
  updateTable: (scope: 'global' | number, id: number, patch: Partial<Omit<Table, 'id'>>) => void
  removeTable: (scope: 'global' | number, id: number) => void
  enableTablesOverride: (venueId: number) => void
  disableTablesOverride: (venueId: number) => void
  // Restaurant
  setRestaurantField: <K extends keyof RestaurantData>(field: K, value: RestaurantData[K]) => void
  // Brand
  setBrandField: <K extends keyof BrandSettings>(field: K, value: BrandSettings[K]) => void
  // Persisted IDs
  setRestauranteId: (id: number) => void
  addSucursalId: (venueId: number, sucursalId: number) => void
  addHorarioIds: (sucursalId: number, ids: number[]) => void
  addMesaIds: (sucursalId: number, ids: number[]) => void
  resetWizard: () => void
  // UI
  step4Expanded: boolean
  setStep4Expanded: (v: boolean) => void
}

const SetupWizardContext = createContext<(SetupWizardState & SetupWizardActions) | null>(null)

let _nextVenueId = 1
let _nextRangeId = 100
let _nextTableId = 1000

function resolveSchedule(state: ScheduleState, scope: 'global' | number): WeekSchedule {
  if (scope === 'global') return state.global
  return state.overrides[scope] ?? state.global
}

function patchSchedule(state: ScheduleState, scope: 'global' | number, week: WeekSchedule): ScheduleState {
  if (scope === 'global') return { ...state, global: week }
  return { ...state, overrides: { ...state.overrides, [scope]: week } }
}

function resolveTables(state: TablesState, scope: 'global' | number): Table[] {
  if (scope === 'global') return state.global
  return state.overrides[scope] ?? state.global
}

function patchTables(state: TablesState, scope: 'global' | number, list: Table[]): TablesState {
  if (scope === 'global') return { ...state, global: list }
  return { ...state, overrides: { ...state.overrides, [scope]: list } }
}

export function SetupWizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [ids, setIds] = useState<PersistedIds>(makeDefaultPersistedIds())
  const { loadProgress, saveProgress } = useOnboardingSync()
  const { token } = useAuthStore()
  const loadedRef = useRef(false)
  const isRestoringRef = useRef(false)
  const [restaurant, setRestaurant] = useState<RestaurantData>(() => makeDefaultRestaurant())
  const [venues, setVenues] = useState<Venue[]>([])
  const [schedule, setSchedule_] = useState<ScheduleState>({
    global: makeDefaultWeekSchedule(),
    overrides: {},
  })
  const [tables, setTables_] = useState<TablesState>({
    global: makeDefaultTables(),
    overrides: {},
  })
  const [brand, setBrand] = useState<BrandSettings>(() => makeDefaultBrand())
  const [step4Expanded, setStep4Expanded_] = useState(false)

  const setStep4Expanded = (v: boolean) => setStep4Expanded_(v)

  // Al montar: intentar restaurar progreso desde el backend
  useEffect(() => {
    if (!token || loadedRef.current) return
    loadedRef.current = true
    isRestoringRef.current = true
    loadProgress().then(status => {
      if (!status) {
        isRestoringRef.current = false
        return
      }
      const restored = progressDataToState(status.datos)
      setIds(prev => ({ ...prev, ...restored.ids }))
      if (restored.restaurant) setRestaurant(restored.restaurant)
      if (restored.venues && restored.venues.length > 0) setVenues(restored.venues)
      if (status.pasoActual > 1) setCurrentStep(status.pasoActual - 1)
      isRestoringRef.current = false
    })
  }, [token, loadProgress])

  // Al avanzar de paso o actualizar IDs: sincronizar con el backend
  useEffect(() => {
    if (!token || !loadedRef.current || isRestoringRef.current || currentStep === 0) return
    saveProgress(currentStep + 1, ids, restaurant, venues)
  }, [currentStep, ids, restaurant, venues, token, saveProgress])

  const updateTables = (scope: 'global' | number, updater: (t: Table[]) => Table[]) => {
    setTables_(s => patchTables(s, scope, updater(resolveTables(s, scope))))
  }

  const updateSchedule = (scope: 'global' | number, updater: (w: WeekSchedule) => WeekSchedule) => {
    setSchedule_(s => patchSchedule(s, scope, updater(resolveSchedule(s, scope))))
  }

  const actions: SetupWizardActions = {
    goToStep: (step) => { setCurrentStep(step); setStep4Expanded_(false) },
    nextStep: () => { setCurrentStep(s => s + 1); setStep4Expanded_(false) },
    prevStep: () => { setCurrentStep(s => Math.max(0, s - 1)); setStep4Expanded_(false) },

    setRestauranteId: (id) => setIds(prev => ({ ...prev, restauranteId: id })),
    addSucursalId: (venueId, sucursalId) => setIds(prev => ({
      ...prev,
      sucursalIds: { ...prev.sucursalIds, [venueId]: sucursalId },
    })),
    addHorarioIds: (sucursalId, horarioIds) => setIds(prev => ({
      ...prev,
      horariosBySucursal: { ...prev.horariosBySucursal, [sucursalId]: horarioIds },
    })),
    addMesaIds: (sucursalId, mesaIds) => setIds(prev => ({
      ...prev,
      mesasBySucursal: { ...prev.mesasBySucursal, [sucursalId]: mesaIds },
    })),
    resetWizard: () => {
      clearWizardProgress()
      setCurrentStep(0)
      setIds(makeDefaultPersistedIds())
      setRestaurant(makeDefaultRestaurant())
      setVenues([])
      setBrand(makeDefaultBrand())
    },

    addVenue: (v) => {
      const id = _nextVenueId++
      setVenues(vs => [...vs, { id, ...v }])
    },
    updateVenue: (id, patch) => {
      setVenues(vs => vs.map(v => v.id === id ? { ...v, ...patch } : v))
    },
    removeVenue: (id) => {
      setVenues(vs => vs.filter(v => v.id !== id))
      setSchedule_(s => {
        const overrides = { ...s.overrides }
        delete overrides[id]
        return { ...s, overrides }
      })
      setTables_(s => {
        const overrides = { ...s.overrides }
        delete overrides[id]
        return { ...s, overrides }
      })
    },

    setDayEnabled: (scope, day, enabled) => {
      updateSchedule(scope, w => ({ ...w, [day]: { ...w[day], enabled } }))
    },
    setTimeRange: (scope, day, rangeId, field, value) => {
      updateSchedule(scope, w => ({
        ...w,
        [day]: {
          ...w[day],
          ranges: w[day].ranges.map(r => r.id === rangeId ? { ...r, [field]: value } : r),
        },
      }))
    },
    addTimeRange: (scope, day) => {
      updateSchedule(scope, w => ({
        ...w,
        [day]: {
          ...w[day],
          ranges: [...w[day].ranges, { id: _nextRangeId++, open: '20:00', close: '23:00' }],
        },
      }))
    },
    removeTimeRange: (scope, day, rangeId) => {
      updateSchedule(scope, w => ({
        ...w,
        [day]: { ...w[day], ranges: w[day].ranges.filter(r => r.id !== rangeId) },
      }))
    },
    copyDay: (scope, fromDay, toDays) => {
      updateSchedule(scope, w => {
        const source = w[fromDay]
        const patch = Object.fromEntries(
          toDays.map(d => [d, {
            ...source,
            ranges: source.ranges.map((r): TimeRange => ({ ...r, id: _nextRangeId++ })),
          }])
        )
        return { ...w, ...patch }
      })
    },

    enableOverride: (venueId) => {
      setSchedule_(s => ({
        ...s,
        overrides: {
          ...s.overrides,
          [venueId]: makeDefaultWeekSchedule(),
        },
      }))
    },
    disableOverride: (venueId) => {
      setSchedule_(s => {
        const overrides = { ...s.overrides }
        overrides[venueId] = null
        return { ...s, overrides }
      })
    },

    addTable: (scope, table) => {
      updateTables(scope, t => [...t, { id: _nextTableId++, ...table }])
    },
    addManyTables: (scope, { count, prefix, startNumber, capacity }) => {
      const newTables: Table[] = Array.from({ length: count }, (_, i) => ({
        id: _nextTableId++,
        name: `${prefix} ${startNumber + i}`,
        capacity,
      }))
      updateTables(scope, t => [...t, ...newTables])
    },
    updateTable: (scope, id, patch) => {
      updateTables(scope, t => t.map(table => table.id === id ? { ...table, ...patch } : table))
    },
    removeTable: (scope, id) => {
      updateTables(scope, t => t.filter(table => table.id !== id))
    },
    enableTablesOverride: (venueId) => {
      setTables_(s => ({
        ...s,
        overrides: { ...s.overrides, [venueId]: [...s.global.map(t => ({ ...t, id: _nextTableId++ }))] },
      }))
    },
    disableTablesOverride: (venueId) => {
      setTables_(s => {
        const overrides = { ...s.overrides }
        overrides[venueId] = null
        return { ...s, overrides }
      })
    },

    setRestaurantField: (field, value) => {
      setRestaurant(r => {
        const updated = { ...r, [field]: value }
        if (field === 'nombrePublico') {
          updated.slug = slugify(value as string)
        }
        return updated
      })
    },

    setBrandField: (field, value) => {
      setBrand(b => ({ ...b, [field]: value }))
    },

    step4Expanded,
    setStep4Expanded,
  }

  return (
    <SetupWizardContext.Provider value={{ currentStep, restaurant, venues, schedule, tables, brand, ids, ...actions }}>
      {children}
    </SetupWizardContext.Provider>
  )
}

export function useSetupWizard() {
  const ctx = useContext(SetupWizardContext)
  if (!ctx) throw new Error('useSetupWizard must be used within SetupWizardProvider')
  return ctx
}
