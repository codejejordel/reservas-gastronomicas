import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Venue, ScheduleState, WeekSchedule, DayKey, TimeRange, TablesState, Table, BrandSettings } from './setupTypes'
import { makeDefaultWeekSchedule, makeDefaultTables, makeDefaultBrand } from './setupTypes'

interface SetupWizardState {
  currentStep: number
  venues: Venue[]
  schedule: ScheduleState
  tables: TablesState
  brand: BrandSettings
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
  // Brand
  setBrandField: <K extends keyof BrandSettings>(field: K, value: BrandSettings[K]) => void
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
  const [currentStep, setCurrentStep] = useState(1)
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

  const updateTables = (scope: 'global' | number, updater: (t: Table[]) => Table[]) => {
    setTables_(s => patchTables(s, scope, updater(resolveTables(s, scope))))
  }

  const updateSchedule = (scope: 'global' | number, updater: (w: WeekSchedule) => WeekSchedule) => {
    setSchedule_(s => patchSchedule(s, scope, updater(resolveSchedule(s, scope))))
  }

  const actions: SetupWizardActions = {
    goToStep: (step) => { setCurrentStep(step); setStep4Expanded_(false) },
    nextStep: () => { setCurrentStep(s => s + 1); setStep4Expanded_(false) },
    prevStep: () => { setCurrentStep(s => Math.max(1, s - 1)); setStep4Expanded_(false) },

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

    setBrandField: (field, value) => {
      setBrand(b => ({ ...b, [field]: value }))
    },

    step4Expanded,
    setStep4Expanded,
  }

  return (
    <SetupWizardContext.Provider value={{ currentStep, venues, schedule, tables, brand, ...actions }}>
      {children}
    </SetupWizardContext.Provider>
  )
}

export function useSetupWizard() {
  const ctx = useContext(SetupWizardContext)
  if (!ctx) throw new Error('useSetupWizard must be used within SetupWizardProvider')
  return ctx
}
