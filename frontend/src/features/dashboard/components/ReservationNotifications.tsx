import { useEffect, useRef, useState } from 'react'
import { Bell, BellRing, CheckCheck, Clock3, Trash2, Users, Volume2, VolumeX, WifiOff, X } from 'lucide-react'
import { useReservationRealtime, type ReservationRealtimeNotification } from '../hooks/useReservationRealtime'

const SOUND_PREFERENCE_KEY = 'reservation-notification-sound-enabled'
const SOUND_PATH = '/sounds/universfield-new-notification-050-494248.mp3'

interface NotificationItem extends ReservationRealtimeNotification {
  read: boolean
}

interface ReservationNotificationsProps {
  restauranteId?: number
  sucursalId?: number
}

export function ReservationNotifications({ restauranteId, sucursalId }: ReservationNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [open, setOpen] = useState(false)
  const [alerting, setAlerting] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem(SOUND_PREFERENCE_KEY) === 'true',
  )
  const [soundUnavailable, setSoundUnavailable] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const alertTimerRef = useRef<number | undefined>(undefined)

  const connectionState = useReservationRealtime(restauranteId, sucursalId, (notification) => {
    setNotifications((current) => [{ ...notification, read: false }, ...current].slice(0, 20))
    setAlerting(true)
    window.clearTimeout(alertTimerRef.current)
    alertTimerRef.current = window.setTimeout(() => setAlerting(false), 500)
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0
      void audioRef.current.play()
        .then(() => setSoundUnavailable(false))
        .catch(() => setSoundUnavailable(true))
    }
  })

  const unreadCount = notifications.filter((notification) => !notification.read).length

  useEffect(() => () => window.clearTimeout(alertTimerRef.current), [])

  useEffect(() => {
    if (!open) return
    headingRef.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    const closeOutside = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)
        && !triggerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        window.requestAnimationFrame(() => {
          const focusedElement = document.activeElement
          if (!focusedElement || focusedElement === document.body || panelRef.current?.contains(focusedElement)) {
            triggerRef.current?.focus()
          }
        })
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOutside)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOutside)
    }
  }, [open])

  const toggleSound = async () => {
    if (soundEnabled) {
      setSoundEnabled(false)
      setSoundUnavailable(false)
      localStorage.setItem(SOUND_PREFERENCE_KEY, 'false')
      return
    }

    setSoundEnabled(true)
    localStorage.setItem(SOUND_PREFERENCE_KEY, 'true')
    if (audioRef.current) {
      audioRef.current.volume = 0.35
      try {
        await audioRef.current.play()
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        setSoundUnavailable(false)
      } catch {
        setSoundUnavailable(true)
      }
    }
  }

  const connectionLabel = connectionState === 'connected'
    ? 'Actualizaciones en vivo conectadas'
    : connectionState === 'connecting'
      ? 'Conectando actualizaciones en vivo'
      : connectionState === 'reconnecting'
        ? 'Reconectando actualizaciones en vivo'
        : 'Actualizaciones en vivo desconectadas'

  return (
    <div className="relative">
      <audio ref={audioRef} src={SOUND_PATH} preload="none" />
      <span className="sr-only" role="status" aria-atomic="true">
        {unreadCount
          ? `${unreadCount} ${unreadCount === 1 ? 'reserva nueva sin leer' : 'reservas nuevas sin leer'}. ${connectionLabel}`
          : connectionLabel}
      </span>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high text-on-surface-variant transition-[color,transform,background-color] hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-safe:duration-200 ${alerting ? 'motion-safe:scale-110' : ''}`}
        aria-label={unreadCount ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {alerting ? <BellRing className="h-[18px] w-[18px]" aria-hidden="true" /> : <Bell className="h-[18px] w-[18px]" aria-hidden="true" />}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-on-error shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="reservation-notifications-title"
          className="fixed left-3 right-3 top-[4.5rem] z-50 max-h-[min(72svh,34rem)] overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-[3.25rem] sm:w-[23rem]"
        >
          <div className="flex items-start justify-between gap-3 border-b border-outline-variant p-4">
            <div>
              <h2 id="reservation-notifications-title" ref={headingRef} tabIndex={-1} className="text-sm font-bold text-on-surface focus:outline-none">
                Reservas nuevas
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-on-surface-variant">
                {connectionState === 'connected' ? (
                  <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
                )}
                {connectionLabel}
              </p>
            </div>
            <button type="button" onClick={() => { setOpen(false); triggerRef.current?.focus() }} className="flex h-11 w-11 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Cerrar notificaciones">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 border-b border-outline-variant px-3 py-2">
            <button type="button" onClick={toggleSound} aria-pressed={soundEnabled} className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              {soundEnabled ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
              {soundEnabled ? 'Sonido activado' : 'Activar sonido'}
            </button>
            {unreadCount > 0 && (
              <button type="button" onClick={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))} className="flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-xs font-semibold text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <CheckCheck className="h-4 w-4" aria-hidden="true" /> Todo leído
              </button>
            )}
          </div>

          {soundUnavailable && (
            <p className="border-b border-outline-variant bg-warning/10 px-4 py-2 text-xs text-on-surface-variant">
              El sonido no está disponible. Las alertas visuales siguen activas.
            </p>
          )}

          <div className="max-h-[23rem] overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Bell className="mx-auto h-6 w-6 text-on-surface-dim" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-on-surface">Sin novedades</p>
                <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">Las reservas nuevas de este local aparecerán acá.</p>
              </div>
            ) : notifications.map((notification) => (
              <button
                type="button"
                 key={notification.eventId}
                 onClick={() => setNotifications((current) => current.map((item) => item.eventId === notification.eventId ? { ...item, read: true } : item))}
                 className={`relative block w-full border-b border-outline-variant px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-container-high focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${notification.read ? '' : 'bg-primary/5'}`}
               >
                 {!notification.read && <span className="absolute left-1.5 top-5 h-2 w-2 rounded-full bg-primary" aria-hidden="true" />}
                 <div className="flex items-start justify-between gap-3">
                   <p className="text-sm font-bold text-on-surface">{notification.title}</p>
                   <span className="shrink-0 font-mono text-xs text-on-surface-variant">{notification.codigoReserva}</span>
                 </div>
                <p className="mt-1 truncate text-xs font-medium text-on-surface-variant">
                  {notification.clienteNombre || 'Reserva sin nombre'} · {notification.sucursalNombre}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-on-surface-variant">
                   <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{notification.horaReserva}</span>
                   <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" aria-hidden="true" />{notification.cantPersonas} comensales</span>
                 </div>
                 <span className="sr-only">
                   {notification.read ? 'Leída.' : 'Sin leer. Activar para marcar como leída.'}
                 </span>
               </button>
            ))}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-outline-variant p-2">
              <button type="button" onClick={() => setNotifications([])} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-error/10 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Limpiar notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
