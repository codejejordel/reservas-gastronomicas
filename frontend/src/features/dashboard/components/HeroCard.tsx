export function HeroCard() {
  return (
    <div
      className="relative w-full h-full min-h-[280px] rounded-[24px] p-8 flex flex-col justify-center overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, var(--color-primary) 0%, #ff6b9d 25%, #ff9a56 50%, var(--color-accent, #4facfe) 75%, #4facfe 100%)',
      }}
    >
      {/* Overlay para profundidad */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.25) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(0,0,0,0.15) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10">
        <h2 className="text-[32px] font-bold text-white leading-tight mb-2">
          Reservas Inteligentes
        </h2>
        <p className="text-[14px] text-white/85 max-w-[340px] leading-relaxed">
          Este es tu dashboard de gestión de reservas más moderno del mercado
        </p>
      </div>
    </div>
  )
}
