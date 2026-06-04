import { Globe, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { BrandSettings, BorderRadiusStyle } from '@/features/setup/state/setupTypes'
import { ImageUploader } from './ImageUploader'
import { ColorPicker } from './ColorPicker'
import { FontSelector } from './FontSelector'

interface BrandingFormProps {
  brand: BrandSettings
  onChange: <K extends keyof BrandSettings>(field: K, value: BrandSettings[K]) => void
}

const RADIUS_OPTIONS: { id: BorderRadiusStyle; label: string; preview: string }[] = [
  { id: 'minimal', label: 'Minimal', preview: '2px' },
  { id: 'soft', label: 'Suave', preview: '10px' },
  { id: 'rounded', label: 'Redondo', preview: '20px' },
]

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-outline-variant last:border-0 pb-5 mb-1">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full py-1 mb-3 text-left"
      >
        <span className="text-sm font-bold text-on-surface">{title}</span>
        <ChevronDown size={14} className={`text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="flex flex-col gap-4">{children}</div>}
    </div>
  )
}

export function BrandingForm({ brand, onChange }: BrandingFormProps) {
  return (
    <div className="flex flex-col gap-0 overflow-y-auto pr-1">
      <Section title="Imágenes">
        <div className="flex gap-4 flex-wrap">
          <ImageUploader
            value={brand.logoDataUrl}
            onChange={v => onChange('logoDataUrl', v)}
            label="Logo"
            hint="PNG, SVG o JPG. Máx 2MB"
            shape="square"
          />
          <div className="flex-1 min-w-[160px]">
            <ImageUploader
              value={brand.bannerDataUrl}
              onChange={v => onChange('bannerDataUrl', v)}
              label="Foto del local"
              hint="Se muestra en la sidebar de la agenda"
              shape="wide"
            />
          </div>
        </div>
      </Section>

      <Section title="Estética">
        <ColorPicker label="Color primario" value={brand.primaryColor} onChange={v => onChange('primaryColor', v)} />
        <ColorPicker label="Color acento" value={brand.accentColor} onChange={v => onChange('accentColor', v)} />

        <FontSelector label="Tipografía de títulos" value={brand.headingFont} onChange={v => onChange('headingFont', v)} />
        <FontSelector label="Tipografía de cuerpo" value={brand.bodyFont} onChange={v => onChange('bodyFont', v)} />

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-on-surface-variant">Bordes</label>
          <div className="flex gap-2">
            {RADIUS_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange('borderRadius', opt.id)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${brand.borderRadius === opt.id ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary/40'}`}
              >
                <div style={{ width: 28, height: 18, border: `2px solid currentColor`, borderRadius: opt.preview }} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </Section>


      <Section title="Redes sociales" defaultOpen={false}>
        {[
          { field: 'instagram' as const, icon: <span className="text-xs font-bold">IG</span>, placeholder: 'instagram.com/tu-local' },
          { field: 'facebook' as const, icon: <span className="text-xs font-bold">FB</span>, placeholder: 'facebook.com/tu-local' },
          { field: 'website' as const, icon: <Globe size={14} />, placeholder: 'www.tu-restaurante.com' },
        ].map(({ field, icon, placeholder }) => (
          <div key={field} className="flex items-center border border-outline-variant rounded-lg overflow-hidden bg-white focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(7,169,169,0.15)] transition-all">
            <span className="px-3 py-2 text-on-surface-variant bg-surface-container border-r border-outline-variant shrink-0">{icon}</span>
            <input
              type="url"
              value={brand[field]}
              onChange={e => onChange(field, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 text-sm text-on-surface outline-none bg-transparent"
            />
          </div>
        ))}
      </Section>
    </div>
  )
}
