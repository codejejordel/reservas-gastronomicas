import type React from 'react'
import { useParams } from '@tanstack/react-router'
import { BookingSuccessPage } from './components/success/BookingSuccessPage'
import { useRestaurantePublico } from './hooks/useRestaurantePublico'

export function BookingSuccessWrapper() {
  const { slug, codigo } = useParams({ from: '/r/$slug/reservar/exito/$codigo' })
  const accessToken = new URLSearchParams(window.location.search).get('token') ?? undefined

  const { data: restaurante } = useRestaurantePublico(slug)

  const cssVars = {
    '--color-primary': restaurante?.colorPrimario || 'var(--color-primary)',
    '--color-accent': restaurante?.colorAcento || 'var(--color-accent)',
  } as React.CSSProperties

  return (
    <div style={cssVars}>
      <BookingSuccessPage codigo={codigo} accessToken={accessToken} restaurante={restaurante} />
    </div>
  )
}
