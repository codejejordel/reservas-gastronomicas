import { memo } from 'react'

export const HeroBackground = memo(function HeroBackground() {
  return (
    <>
      {/* SVG grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      {/* Blobs morph */}
      <div
        className="blob absolute w-[420px] h-[420px] -top-24 -left-24 opacity-[0.07] rounded-full"
        style={{ background: '#7bf5f7' }}
      />
      <div
        className="blob-2 absolute w-[280px] h-[280px] bottom-12 right-16 opacity-[0.08] rounded-full"
        style={{ background: '#5bd9da' }}
      />
      <div
        className="blob-3 absolute w-[180px] h-[180px] opacity-[0.06] rounded-full"
        style={{ background: '#fff', top: '38%', left: '52%' }}
      />

      {/* Aurora (replacement for particles) */}
      <div
        className="hero-aurora absolute w-[600px] h-[600px] -top-40 -right-32 opacity-[0.12] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #7bf5f7 0%, #07a7a9 40%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'aurora-drift 18s ease-in-out infinite',
        }}
      />
      <div
        className="hero-aurora absolute w-[400px] h-[400px] bottom-0 left-10 opacity-[0.08] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #5bd9da 0%, #003536 60%, transparent 80%)',
          filter: 'blur(50px)',
          animation: 'aurora-drift 14s ease-in-out infinite reverse',
        }}
      />

      {/* Grain overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.04, mixBlendMode: 'overlay' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="hero-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain)" />
      </svg>

      {/* Waves */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="rgba(255,255,255,0.04)"
          d="M0,80 C360,130 720,30 1080,80 C1260,105 1380,60 1440,75 L1440,160 L0,160 Z"
        />
        <path
          fill="rgba(123,245,247,0.06)"
          d="M0,110 C240,80 480,135 720,110 C960,85 1200,125 1440,105 L1440,160 L0,160 Z"
        />
      </svg>
    </>
  )
})
