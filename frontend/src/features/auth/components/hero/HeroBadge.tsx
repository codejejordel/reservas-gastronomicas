import { PulseDot } from '@/shared/ui/PulseDot'

interface HeroBadgeProps {
  text: string
}

export function HeroBadge({ text }: HeroBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-3 lg:mb-6 backdrop-blur-sm">
      <PulseDot />
      <span className="text-[11px] font-bold text-primary-fixed uppercase tracking-widest">
        {text}
      </span>
    </div>
  )
}
