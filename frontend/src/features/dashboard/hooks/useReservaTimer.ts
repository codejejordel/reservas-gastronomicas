import { useState, useEffect, useCallback } from 'react'
import { TOLERANCIA_MINUTOS } from '../constants'

export type ReservaStatus = 'pending' | 'overtime' | 'expired'

export interface TimerState {
  status: ReservaStatus
  minutesOverdue: number
}

function parseHora(hora: string): Date {
  const [h, m] = hora.split(':').map(Number)
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0)
}

export function useReservaTimer(horaReserva: string): TimerState {
  const [state, setState] = useState<TimerState>(() => computeState(horaReserva))

  const tick = useCallback(() => {
    setState(computeState(horaReserva))
  }, [horaReserva])

  useEffect(() => {
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tick])

  return state
}

function computeState(horaReserva: string): TimerState {
  const resTime = parseHora(horaReserva)
  const now = new Date()
  const diffMs = now.getTime() - resTime.getTime()
  const diffMin = diffMs / 1000 / 60

  if (diffMin <= 0) {
    return { status: 'pending', minutesOverdue: 0 }
  }
  if (diffMin <= TOLERANCIA_MINUTOS) {
    return { status: 'overtime', minutesOverdue: Math.floor(diffMin) }
  }
  return { status: 'expired', minutesOverdue: Math.floor(diffMin) }
}
