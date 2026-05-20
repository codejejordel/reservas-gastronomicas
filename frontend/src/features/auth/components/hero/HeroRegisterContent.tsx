import { HeroBadge } from './HeroBadge'

const STEPS = [
  { n: 1, label: 'Creá tu cuenta', active: true },
  { n: 2, label: 'Registrá tu restaurante', active: false },
  { n: 3, label: 'Definí tus horarios', active: false },
  { n: 4, label: 'Gestioná tus mesas', active: false },
  { n: 5, label: 'Personalizá tu agenda', active: false },
  { n: 6, label: '¡Listo para recibir reservas!', active: false },
]

interface HeroRegisterContentProps {
  mobile?: boolean
}

export function HeroRegisterContent({ mobile }: HeroRegisterContentProps = {}) {
  return (
    <div style={{ width: '100%' }}>
      <HeroBadge text="Configuración en minutos" />
      <h1
        className="text-white leading-tight"
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: mobile ? 'clamp(1.6rem, 7vw, 2.2rem)' : 'clamp(1.5rem, 3.2vw, 3rem)',
          fontWeight: 700,
          lineHeight: 1.15,
          marginBottom: '1rem',
        }}
      >
        Empezá a gestionar{' '}
        <em className="not-italic text-primary-fixed">tu restaurante hoy.</em>
      </h1>
      {!mobile && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', maxWidth: 340, marginBottom: '1.5rem', lineHeight: 1.6 }}>
        En menos de 3 minutos tenés tu agenda lista. Sin tarjeta de crédito.
      </p>}
      {!mobile && <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {STEPS.map(({ n, label, active }) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: active ? 1 : 0.5 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? 'var(--color-primary-fixed)' : 'rgba(255,255,255,0.2)',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: active ? 'var(--color-on-primary-fixed)' : 'white' }}>
                {n}
              </span>
            </div>
            <span style={{ fontSize: '0.875rem', color: 'white', fontWeight: active ? 600 : 400 }}>
              {label}
            </span>
          </div>
        ))}
      </div>}
    </div>
  )
}
