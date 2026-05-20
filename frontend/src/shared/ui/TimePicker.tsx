import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const BASE_MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  hasError?: boolean
}

export function TimePicker({ value, onChange, hasError }: TimePickerProps) {
  const [hh = '09', mm = '00'] = value.split(':')
  const minutes = BASE_MINUTES.includes(mm) ? BASE_MINUTES : [...BASE_MINUTES, mm].sort()

  const setHour = (h: string) => onChange(`${h}:${mm}`)
  const setMinute = (m: string) => onChange(`${hh}:${m}`)

  const triggerClass = [
    'h-8 w-14 gap-0 px-1.5 text-sm font-medium border rounded-lg',
    'bg-white focus:ring-2 focus:ring-primary/20',
    'focus:border-primary transition-all',
    hasError ? 'border-error' : 'border-outline-variant',
  ].join(' ')

  return (
    <div className="flex items-center gap-0.5">
      <Select value={hh} onValueChange={setHour}>
        <SelectTrigger className={triggerClass}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-48 overflow-y-auto bg-white border border-outline-variant shadow-lg">
          {HOURS.map(h => (
            <SelectItem key={h} value={h}>{h}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-sm font-bold text-on-surface-variant select-none">:</span>

      <Select value={mm} onValueChange={setMinute}>
        <SelectTrigger className={triggerClass}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-48 overflow-y-auto bg-white border border-outline-variant shadow-lg">
          {minutes.map((m: string) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
