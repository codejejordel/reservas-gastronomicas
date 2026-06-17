import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { RestaurantePublic, SucursalPublic, ClienteData } from '../types/bookingTypes'
import { makeDefaultClienteData } from '../types/bookingTypes'

export interface BookingState {
  restaurante: RestaurantePublic | null
  sucursal: SucursalPublic | null
  partySize: number
  fecha: string | null
  hora: string | null
  cliente: ClienteData
  currentStep: 0 | 1 | 2 | 3 | 4
  metodoPago: 'MP' | 'TRANSFERENCIA' | null
  acceptedTerms: boolean
  submitting: boolean
  error: string | null
}

export interface BookingActions {
  setRestaurante: (r: RestaurantePublic) => void
  setSucursal: (s: SucursalPublic) => void
  setPartySize: (n: number) => void
  setFecha: (f: string | null) => void
  setHora: (h: string | null) => void
  setClienteField: <K extends keyof ClienteData>(field: K, value: ClienteData[K]) => void
  setMetodoPago: (m: 'MP' | 'TRANSFERENCIA' | null) => void
  setAcceptedTerms: (v: boolean) => void
  goToStep: (step: 0 | 1 | 2 | 3 | 4) => void
  nextStep: () => void
  prevStep: () => void
  setSubmitting: (s: boolean) => void
  setError: (e: string | null) => void
  reset: () => void
}

const BookingContext = createContext<(BookingState & BookingActions) | null>(null)

function makeInitialState(): BookingState {
  return {
    restaurante: null,
    sucursal: null,
    partySize: 2,
    fecha: null,
    hora: null,
    cliente: makeDefaultClienteData(),
    currentStep: 0,
    metodoPago: null,
    acceptedTerms: false,
    submitting: false,
    error: null,
  }
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(makeInitialState())

  // Memoizar todas las acciones para evitar recreación en cada render
  const setRestaurante = useCallback((r: RestaurantePublic) => setState(s => ({ ...s, restaurante: r })), [])
  const setSucursal = useCallback((s: SucursalPublic) => setState(st => ({ ...st, sucursal: s })), [])
  const setPartySize = useCallback((n: number) => setState(s => ({ ...s, partySize: Math.max(1, n) })), [])
  const setFecha = useCallback((f: string | null) => setState(s => ({ ...s, fecha: f })), [])
  const setHora = useCallback((h: string | null) => setState(s => ({ ...s, hora: h })), [])
  const setClienteField = useCallback(<K extends keyof ClienteData>(field: K, value: ClienteData[K]) => {
    setState(s => ({ ...s, cliente: { ...s.cliente, [field]: value } }))
  }, [])
  const setMetodoPago = useCallback((m: 'MP' | 'TRANSFERENCIA' | null) => setState(s => ({ ...s, metodoPago: m })), [])
  const setAcceptedTerms = useCallback((v: boolean) => setState(s => ({ ...s, acceptedTerms: v })), [])
  const goToStep = useCallback((step: 0 | 1 | 2 | 3 | 4) => setState(s => ({ ...s, currentStep: step })), [])
  const nextStep = useCallback(() => setState(s => ({ ...s, currentStep: Math.min(4, s.currentStep + 1) as 0 | 1 | 2 | 3 | 4 })), [])
  const prevStep = useCallback(() => setState(s => ({ ...s, currentStep: Math.max(0, s.currentStep - 1) as 0 | 1 | 2 | 3 | 4 })), [])
  const setSubmitting = useCallback((sub: boolean) => setState(s => ({ ...s, submitting: sub })), [])
  const setError = useCallback((e: string | null) => setState(s => ({ ...s, error: e })), [])
  const reset = useCallback(() => setState(makeInitialState()), [])

  const actions = useMemo<BookingActions>(() => ({
    setRestaurante,
    setSucursal,
    setMetodoPago,
    setAcceptedTerms,
    setPartySize,
    setFecha,
    setHora,
    setClienteField,
    goToStep,
    nextStep,
    prevStep,
    setSubmitting,
    setError,
    reset,
  }), [setRestaurante, setSucursal, setMetodoPago, setAcceptedTerms, setPartySize, setFecha, setHora, setClienteField, goToStep, nextStep, prevStep, setSubmitting, setError, reset])

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions])

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within BookingProvider')
  return ctx
}
