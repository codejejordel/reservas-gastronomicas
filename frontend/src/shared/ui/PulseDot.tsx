export function PulseDot({ className }: { className?: string }) {
  return (
    <span
      className={className}
      style={{
        display: 'block',
        width: 8,
        height: 8,
        borderRadius: '9999px',
        backgroundColor: '#7bf5f7',
        animation: 'pulse-dot 2s ease-in-out infinite',
      }}
    />
  )
}
