import { Client, ReconnectionTimeMode, type IMessage, type StompSubscription } from '@stomp/stompjs'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store/authStore'

export interface ReservationRealtimeNotification {
  eventId: string
  reservaId: number
  codigoReserva: string
  restauranteId: number
  sucursalId: number
  sucursalNombre: string
  title: string
  fechaReserva: string
  horaReserva: string
  cantPersonas: number
  estado: string
  clienteNombre: string | null
  occurredAt: string
}

export type RealtimeConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected'

const RESERVATION_QUERY_KEYS = new Set(['reservas-hoy', 'reservas-mes', 'reservation-search'])

function websocketUrl() {
  const configuredBase = import.meta.env.VITE_API_BASE_URL
  const apiOrigin = configuredBase
    ? new URL(configuredBase, window.location.origin).origin
    : window.location.origin
  const url = new URL('/api/ws', apiOrigin)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return url.toString()
}

export function useReservationRealtime(
  restauranteId: number | undefined,
  sucursalId: number | undefined,
  onNotification: (notification: ReservationRealtimeNotification) => void,
) {
  const token = useAuthStore((state) => state.token)
  const queryClient = useQueryClient()
  const seenEventIds = useRef(new Set<string>())
  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>('disconnected')
  const notify = useEffectEvent(onNotification)
  const isCurrentBranch = useEffectEvent((expectedRestauranteId: number, expectedSucursalId: number) => (
    restauranteId === expectedRestauranteId && sucursalId === expectedSucursalId
  ))

  useEffect(() => {
    if (!token || !restauranteId || !sucursalId) {
      return
    }

    let active = true
    let subscription: StompSubscription | undefined
    const invalidateReservationQueries = () => queryClient.invalidateQueries({
      predicate: (query) => RESERVATION_QUERY_KEYS.has(String(query.queryKey[0])),
    })
    const client = new Client({
      brokerURL: websocketUrl(),
      connectHeaders: { Authorization: `Bearer ${token}` },
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      reconnectDelay: 1_000,
      maxReconnectDelay: 30_000,
      reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
      connectionTimeout: 8_000,
      onConnect: () => {
        if (!active || !isCurrentBranch(restauranteId, sucursalId)) return
        setConnectionState('connected')
        invalidateReservationQueries()
        subscription = client.subscribe(
          `/topic/restaurantes/${restauranteId}/sucursales/${sucursalId}/reservas`,
          (message: IMessage) => {
            if (!active || !isCurrentBranch(restauranteId, sucursalId)) return
            try {
              const notification = JSON.parse(message.body) as ReservationRealtimeNotification
              if (notification.restauranteId !== restauranteId
                || notification.sucursalId !== sucursalId
                || !notification.eventId
                || seenEventIds.current.has(notification.eventId)) return

              seenEventIds.current.add(notification.eventId)
              if (seenEventIds.current.size > 100) {
                const oldest = seenEventIds.current.values().next().value
                if (oldest) seenEventIds.current.delete(oldest)
              }
              notify(notification)
              invalidateReservationQueries()
            } catch {
              // Malformed ephemeral messages are ignored; query data remains authoritative.
            }
          },
        )
      },
      onWebSocketClose: () => {
        if (active) setConnectionState('reconnecting')
      },
      onStompError: () => {
        if (active) setConnectionState('reconnecting')
      },
      onWebSocketError: () => {
        if (active) setConnectionState('reconnecting')
      },
    })

    client.activate()

    return () => {
      active = false
      subscription?.unsubscribe()
      void client.deactivate()
    }
  }, [token, restauranteId, sucursalId, queryClient])

  if (!token || !restauranteId || !sucursalId) return 'disconnected'
  return connectionState === 'disconnected' ? 'connecting' : connectionState
}
