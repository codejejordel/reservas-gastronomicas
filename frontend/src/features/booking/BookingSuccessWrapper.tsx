import type React from 'react'
import { useParams } from '@tanstack/react-router'
import { BookingSuccessPage } from './components/success/BookingSuccessPage'
import { useRestaurantePublico } from './hooks/useRestaurantePublico'
import { useReservaByCodigo } from './hooks/useReservaByCodigo'

export function BookingSuccessWrapper() {
  const { slug, codigo } = useParams({ from: '/r/$slug/reservar/exito/$codigo' })

  const { data: restaurante } = useRestaurantePublico(slug)
  const { data: reserva } = useReservaByCodigo(codigo)

  const cssVars = {
    '--color-primary': restaurante?.colorPrimario || 'var(--color-primary)',
    '--color-accent': restaurante?.colorAcento || 'var(--color-accent)',
  } as React.CSSProperties

  return (
    <div style={cssVars}>
      <BookingSuccessPage codigo={codigo} restaurante={restaurante} reserva={reserva} />
    </div>
  )
}
