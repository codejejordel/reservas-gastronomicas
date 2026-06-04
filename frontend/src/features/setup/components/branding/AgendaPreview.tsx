import { useState } from 'react'
import { Bell, HelpCircle, Sun, Moon, Clock, Calendar, Users, Monitor, Smartphone, Maximize2, X } from 'lucide-react'
import type { BrandSettings, RestaurantData } from '@/features/setup/state/setupTypes'
import { getFontCss, getBorderRadius } from './brandingUtils'

interface AgendaPreviewProps {
  brand: BrandSettings
  restaurant: RestaurantData
  onExpand?: () => void
  onClose?: () => void
  expanded?: boolean
}

const MOCK_SHIFTS = [
  {
    id: 'lunch',
    label: 'Comida',
    icon: 'sun',
    range: '13:00 - 15:30',
    slots: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
    disabled: ['15:30'],
  },
  {
    id: 'dinner',
    label: 'Cena',
    icon: 'moon',
    range: '20:00 - 23:00',
    slots: ['20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'],
    disabled: [],
  },
]

const SELECTED_SLOT = '21:30'

function TimeSlot({ time, selected, disabled, primary, radius }: {
  time: string
  selected: boolean
  disabled: boolean
  primary: string
  radius: string
}) {
  return (
    <div
      style={{
        borderRadius: radius,
        background: selected ? primary : disabled ? '#f5f5f5' : 'white',
        color: selected ? 'white' : disabled ? '#bbb' : '#1a1a1a',
        border: selected ? `1.5px solid ${primary}` : '1.5px solid #e5e7eb',
        padding: '0.5rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        fontWeight: selected ? 700 : 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {time}
    </div>
  )
}

function DesktopPreview({ brand, restaurant }: { brand: BrandSettings; restaurant: RestaurantData }) {
  const headingFont = getFontCss(brand.headingFont)
  const bodyFont = getFontCss(brand.bodyFont)
  const radius = getBorderRadius(brand.borderRadius)
  const primary = brand.primaryColor

  return (
    <div style={{ fontFamily: bodyFont, background: '#f0f4f8', borderRadius: 16, overflow: 'hidden', display: 'flex', gap: 0, minHeight: 480 }}>
      {/* Main content */}
      <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: 520 }}>
        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: '#888' }}>
          {['Detalles', 'Horario', 'Confirmación'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: i === 1 ? primary : i < 1 ? '#e2e8f0' : '#e2e8f0',
                color: i === 1 ? 'white' : '#888',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 700,
              }}>
                {i + 1}
              </div>
              <span style={{ fontWeight: i === 1 ? 700 : 400, color: i === 1 ? '#1a1a1a' : '#888' }}>{s}</span>
              {i < 2 && <span style={{ color: '#ccc' }}>—</span>}
            </div>
          ))}
        </div>

        {/* Banner */}
        <div style={{ background: `${primary}18`, borderLeft: `3px solid ${primary}`, padding: '0.4rem 0.75rem', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, color: primary, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          ⇥ Estás reservando en: {restaurant.nombrePublico || 'Tu Restaurante'}
        </div>

        {/* Title */}
        <div>
          <h2 style={{ fontFamily: headingFont, fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.2 }}>
            Selecciona tu horario
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.4rem' }}>
            Elige el turno que mejor se adapte a tu visita en {restaurant.nombrePublico || 'Tu Restaurante'}.
          </p>
        </div>

        {/* Shifts */}
        {MOCK_SHIFTS.map(shift => (
          <div key={shift.id} style={{ background: 'white', borderRadius: 12, padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                {shift.icon === 'sun' ? <Sun size={15} color={primary} /> : <Moon size={15} color={primary} />}
                {shift.label}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#888' }}>{shift.range}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
              {shift.slots.map(slot => (
                <TimeSlot key={slot} time={slot} selected={slot === SELECTED_SLOT} disabled={shift.disabled.includes(slot)} primary={primary} radius={radius} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div style={{ width: 200, background: 'white', display: 'flex', flexDirection: 'column', gap: 0, flexShrink: 0, boxShadow: '-2px 0 8px rgba(0,0,0,0.05)' }}>
        {/* Banner image */}
        <div style={{ height: 100, background: brand.bannerDataUrl ? 'transparent' : 'linear-gradient(135deg,#003536,#07a7a9)', position: 'relative', overflow: 'hidden' }}>
          {brand.bannerDataUrl
            ? <img src={brand.bannerDataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : null
          }
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.5rem 0.75rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}>
            <p style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem', margin: 0, fontFamily: headingFont }}>{restaurant.nombrePublico || 'Tu Restaurante'}</p>
            {restaurant.ciudadPrincipal && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', margin: 0 }}>{restaurant.ciudadPrincipal}</p>}
          </div>
        </div>

        {/* Resumen */}
        <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', margin: 0 }}>Resumen de reserva</p>
          {[
            { icon: <Users size={12} color={primary} />, label: 'Comensales', value: '2 Adultos' },
            { icon: <Calendar size={12} color={primary} />, label: 'Fecha', value: 'Martes 3 Octubre' },
            { icon: <Clock size={12} color={primary} />, label: 'Hora', value: '21:30', highlight: true },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
              <div style={{ marginTop: 1 }}>{item.icon}</div>
              <div>
                <p style={{ fontSize: '0.6rem', color: '#888', margin: 0 }}>{item.label}</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: item.highlight ? primary : '#1a1a1a', margin: 0 }}>{item.value}</p>
              </div>
            </div>
          ))}
          <div style={{ background: '#fff7ed', borderRadius: 8, padding: '0.5rem', fontSize: '0.6rem', color: '#92400e', marginTop: '0.25rem' }}>
            Las reservas tienen una tolerancia de 15 minutos. Pasado este tiempo, la mesa podrá ser liberada.
          </div>
        </div>
      </div>
    </div>
  )
}

function MobilePreview({ brand, restaurant }: { brand: BrandSettings; restaurant: RestaurantData }) {
  const headingFont = getFontCss(brand.headingFont)
  const bodyFont = getFontCss(brand.bodyFont)
  const radius = getBorderRadius(brand.borderRadius)
  const primary = brand.primaryColor

  return (
    <div style={{
      fontFamily: bodyFont,
      width: 280,
      margin: '0 auto',
      background: '#f0f4f8',
      borderRadius: 28,
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      border: '6px solid #1a1a1a',
      maxHeight: 520,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{ background: 'white', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
        <span style={{ fontFamily: getFontCss('sora'), fontWeight: 700, fontSize: '0.9rem', color: primary }}>
          {restaurant.nombrePublico ? restaurant.nombrePublico.split(' ')[0] : 'Turnify'}
        </span>
        <div style={{ display: 'flex', gap: '0.6rem', color: '#888' }}>
          <Bell size={14} />
          <HelpCircle size={14} />
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '0.55rem', fontWeight: 700 }}>HR</span>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {/* Stepper */}
        <div style={{ background: 'white', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6rem', color: '#888', borderBottom: '1px solid #f0f0f0' }}>
          {['Detalles', 'Horario', 'Confirmación'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                background: i === 1 ? primary : '#e2e8f0',
                color: i === 1 ? 'white' : '#aaa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.5rem', fontWeight: 700, flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <span style={{ fontWeight: i === 1 ? 700 : 400, color: i === 1 ? '#1a1a1a' : '#aaa' }}>{s}</span>
              {i < 2 && <span style={{ color: '#ddd' }}>—</span>}
            </div>
          ))}
        </div>

        <div style={{ padding: '0.875rem' }}>
          {/* Banner */}
          <div style={{ background: `${primary}18`, borderLeft: `2px solid ${primary}`, padding: '0.3rem 0.5rem', borderRadius: 4, fontSize: '0.55rem', fontWeight: 700, color: primary, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            ⇥ Estás reservando en: {restaurant.nombrePublico || 'Tu Restaurante'}
          </div>

          {/* Title */}
          <h2 style={{ fontFamily: headingFont, fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.3rem', lineHeight: 1.2 }}>
            Selecciona tu horario
          </h2>
          <p style={{ fontSize: '0.65rem', color: '#666', marginBottom: '0.875rem' }}>
            Elige el turno que mejor se adapte a tu visita en {restaurant.nombrePublico || 'Tu Restaurante'}.
          </p>

          {/* Shifts */}
          {MOCK_SHIFTS.map(shift => (
            <div key={shift.id} style={{ background: 'white', borderRadius: 10, padding: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.8rem' }}>
                  {shift.icon === 'sun' ? <Sun size={13} color={primary} /> : <Moon size={13} color={primary} />}
                  {shift.label}
                </div>
                <span style={{ fontSize: '0.6rem', color: '#888' }}>{shift.range}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                {shift.slots.map(slot => (
                  <TimeSlot key={slot} time={slot} selected={slot === SELECTED_SLOT} disabled={shift.disabled.includes(slot)} primary={primary} radius={radius} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const DESKTOP_WIDTH = 860
const DESKTOP_HEIGHT = 520

const MOBILE_FRAME_WIDTH = 280
const MOBILE_FRAME_HEIGHT = 560

export function AgendaPreview({ brand, restaurant, onExpand, onClose, expanded = false }: AgendaPreviewProps) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold text-on-surface-variant">Vista previa</span>
        <div className="flex items-center gap-2">
          {/* Desktop/Mobile toggle — solo en modo expandido */}
          {expanded && (
            <div className="flex border border-outline-variant rounded-lg overflow-hidden text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${viewport === 'desktop' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                <Monitor size={12} /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${viewport === 'mobile' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                <Smartphone size={12} /> Mobile
              </button>
            </div>
          )}
          {/* Expand button — solo en modo compacto, solo desktop (controlado desde Step4) */}
          {!expanded && onExpand && (
            <button
              type="button"
              onClick={onExpand}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all"
            >
              <Maximize2 size={12} /> Vista completa
            </button>
          )}
          {/* Close button — solo en modo expandido */}
          {expanded && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container hover:text-error transition-all"
            >
              <X size={12} /> Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Preview — scaled via CSS transform so the inner layout renders at full fidelity */}
      <div className="flex-1 flex items-start justify-center overflow-hidden">
        {viewport === 'desktop' ? (
          <div style={{ width: '100%' }}>
            {/* Outer box reserves the scaled height so parent doesn't collapse */}
            <div
              style={{
                width: '100%',
                position: 'relative',
                paddingBottom: `${(DESKTOP_HEIGHT / DESKTOP_WIDTH) * 100}%`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: DESKTOP_WIDTH,
                  height: DESKTOP_HEIGHT,
                  transformOrigin: 'top left',
                  transform: `scale(var(--preview-scale, 1))`,
                  // CSS custom prop set dynamically via inline ref — use a simpler approach:
                  // scale to fill available width via calc
                }}
                ref={el => {
                  if (!el) return
                  const parent = el.parentElement
                  if (!parent) return
                  const scale = parent.clientWidth / DESKTOP_WIDTH
                  el.style.transform = `scale(${scale})`
                }}
              >
                <DesktopPreview brand={brand} restaurant={restaurant} />
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              position: 'relative',
              width: MOBILE_FRAME_WIDTH,
              height: MOBILE_FRAME_HEIGHT,
              flexShrink: 0,
            }}
            ref={el => {
              if (!el) return
              const parent = el.parentElement
              if (!parent) return
              const availW = parent.clientWidth
              const availH = parent.clientHeight || 500
              const scaleW = availW / MOBILE_FRAME_WIDTH
              const scaleH = availH / MOBILE_FRAME_HEIGHT
              const scale = Math.min(scaleW, scaleH, 1)
              el.style.transform = `scale(${scale})`
              el.style.transformOrigin = 'top center'
              el.style.marginBottom = `${(MOBILE_FRAME_HEIGHT * scale) - MOBILE_FRAME_HEIGHT}px`
            }}
          >
            <MobilePreview brand={brand} restaurant={restaurant} />
          </div>
        )}
      </div>
    </div>
  )
}
