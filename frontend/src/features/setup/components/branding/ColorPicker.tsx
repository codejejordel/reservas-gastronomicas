interface ColorPickerProps {
  label: string
  value: string
  onChange: (hex: string) => void
}

const PRESETS = [
  { color: '#005759', name: 'Teal' },
  { color: '#07a7a9', name: 'Aqua' },
  { color: '#b85c38', name: 'Terracota' },
  { color: '#722f37', name: 'Vino' },
  { color: '#5d6e41', name: 'Oliva' },
  { color: '#1e3a5f', name: 'Noche' },
  { color: '#c89b3c', name: 'Mostaza' },
  { color: '#1a1a1a', name: 'Negro' },
]

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-on-surface-variant">{label}</label>
      <div className="flex items-center gap-2 flex-wrap">
        {PRESETS.map(p => (
          <button
            key={p.color}
            type="button"
            title={p.name}
            onClick={() => onChange(p.color)}
            className="w-7 h-7 rounded-full transition-all shrink-0 ring-offset-2"
            style={{
              background: p.color,
              outline: value === p.color ? `2px solid ${p.color}` : '2px solid transparent',
              outlineOffset: 2,
            }}
          />
        ))}
        {/* Native color input */}
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-7 h-7 rounded-full cursor-pointer border border-outline-variant bg-transparent p-0"
          />
          <span
            className="text-xs font-mono text-on-surface border border-outline-variant rounded-md px-2 py-0.5 bg-surface-container-lowest"
          >
            {value}
          </span>
        </label>
      </div>
    </div>
  )
}
