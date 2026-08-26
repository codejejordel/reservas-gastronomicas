import { slugify } from './brandingUtils'

interface SlugInputProps {
  value: string
  onChange: (slug: string) => void
}

export function SlugInput({ value, onChange }: SlugInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-on-surface-variant">URL pública</label>
      <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden bg-surface-container-lowest focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(7,169,169,0.15)] transition-all">
        <span className="px-3 py-2 text-xs text-on-surface-variant bg-surface-container border-r border-outline-variant whitespace-nowrap shrink-0">
          tuapp.com/r/
        </span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(slugify(e.target.value))}
          placeholder="mi-restaurante"
          className="flex-1 px-3 py-2 text-sm text-on-surface outline-none bg-transparent font-mono"
        />
      </div>
      {value && (
        <p className="text-[11px] text-on-surface-variant">
          Tu agenda estará en: <span className="font-semibold text-primary">tuapp.com/r/{value}</span>
        </p>
      )}
    </div>
  )
}
