import { useRef } from 'react'
import { Upload, X } from 'lucide-react'

interface ImageUploaderProps {
  value: string | null
  onChange: (dataUrl: string | null) => void
  label: string
  hint?: string
  shape?: 'square' | 'wide'
}

export function ImageUploader({ value, onChange, label, hint, shape = 'square' }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = e => onChange(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const containerClass = shape === 'wide'
    ? 'w-full h-28'
    : 'w-24 h-24'

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-on-surface-variant">{label}</label>
      {hint && <p className="text-[11px] text-on-surface-variant">{hint}</p>}

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        className={`${containerClass} relative rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-lowest cursor-pointer hover:border-primary hover:bg-surface-container transition-all overflow-hidden group flex items-center justify-center`}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-semibold">Cambiar</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-on-surface-variant">
            <Upload size={18} className="opacity-50" />
            <span className="text-[11px]">Subir imagen</span>
          </div>
        )}
      </div>

      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-error transition-colors w-fit"
        >
          <X size={11} /> Eliminar
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
    </div>
  )
}
