import type { FontFamily } from '@/features/setup/state/setupTypes'

interface FontSelectorProps {
  label: string
  value: FontFamily
  onChange: (font: FontFamily) => void
}

const FONTS: { id: FontFamily; name: string; css: string; sample: string }[] = [
  { id: 'playfair', name: 'Playfair', css: "'Playfair Display', serif", sample: 'Reservá tu mesa' },
  { id: 'sora', name: 'Sora', css: "'Sora', sans-serif", sample: 'Reservá tu mesa' },
  { id: 'inter', name: 'Inter', css: "'Inter', sans-serif", sample: 'Reservá tu mesa' },
  { id: 'dm-sans', name: 'DM Sans', css: "'DM Sans', sans-serif", sample: 'Reservá tu mesa' },
]

export function FontSelector({ label, value, onChange }: FontSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-on-surface-variant">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {FONTS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            className={`flex flex-col gap-0.5 px-3 py-2 rounded-xl border text-left transition-all ${
              value === f.id
                ? 'border-primary bg-primary/5'
                : 'border-outline-variant bg-surface-container-lowest hover:border-primary/40'
            }`}
          >
            <span className="text-[10px] font-semibold text-on-surface-variant">{f.name}</span>
            <span
              className="text-sm text-on-surface leading-tight"
              style={{ fontFamily: f.css }}
            >
              {f.sample}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

