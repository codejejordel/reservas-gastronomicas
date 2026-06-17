interface AddressMapProps {
  direccion: string
  className?: string
}

export function AddressMap({ direccion, className = '' }: AddressMapProps) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`

  return (
    <div className={`relative w-full overflow-hidden rounded-xl border border-outline-variant bg-surface-container ${className}`} style={{ aspectRatio: '16/7' }}>
      <iframe
        title="Mapa de ubicación"
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block' }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}
