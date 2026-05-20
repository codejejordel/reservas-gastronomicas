import { motion } from 'motion/react'
import { Building2, Clock, LayoutGrid, Palette, AlertTriangle, Loader2 } from 'lucide-react'
import { useSetupWizard } from '@/features/setup/state/SetupWizardContext'
import { SummaryCard } from './SummaryCard'
import {
  summarizeVenues,
  summarizeSchedule,
  summarizeTables,
  summarizeBrand,
  isSetupComplete,
} from './summaryHelpers'

interface ReviewViewProps {
  submitting: boolean
  onSubmit: () => void
}

export function ReviewView({ submitting, onSubmit }: ReviewViewProps) {
  const { venues, schedule, tables, brand, goToStep } = useSetupWizard()

  const venuesSummary = summarizeVenues(venues)
  const scheduleSummary = summarizeSchedule(schedule)
  const tablesSummary = summarizeTables(tables)
  const brandSummary = summarizeBrand(brand)
  const { ok, warnings } = isSetupComplete(venues, brand)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.25rem' }}>
          ¡Casi listo!
        </h2>
        <p className="text-sm text-on-surface-variant">
          Revisá tu configuración antes de crear tu agenda pública.
        </p>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="flex flex-col gap-1.5 bg-error-container rounded-xl px-4 py-3">
          {warnings.map(w => (
            <div key={w} className="flex items-start gap-2 text-xs text-error font-medium">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" /> {w}
            </div>
          ))}
        </div>
      )}

      {/* Summary cards */}
      <div className="flex flex-col gap-3">

        {/* Venues */}
        <SummaryCard title="Locales" icon={<Building2 size={15} />} onEdit={() => goToStep(1)}>
          {venuesSummary.count === 0 ? (
            <span className="text-error text-xs">Sin locales configurados</span>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {venuesSummary.names.map(n => (
                <li key={n} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {n}
                </li>
              ))}
            </ul>
          )}
        </SummaryCard>

        {/* Schedule */}
        <SummaryCard title="Horarios" icon={<Clock size={15} />} onEdit={() => goToStep(2)}>
          <ul className="flex flex-col gap-0.5">
            {scheduleSummary.lines.map(l => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          {scheduleSummary.overrideCount > 0 && (
            <p className="mt-1.5 text-xs text-primary font-medium">
              {scheduleSummary.overrideCount} local{scheduleSummary.overrideCount > 1 ? 'es' : ''} con horario personalizado
            </p>
          )}
        </SummaryCard>

        {/* Tables */}
        <SummaryCard title="Mesas" icon={<LayoutGrid size={15} />} onEdit={() => goToStep(3)}>
          {tablesSummary.global === 0 ? (
            <span className="text-on-surface-variant text-xs italic">Sin mesas configuradas</span>
          ) : (
            <div className="flex gap-4">
              <span><strong className="text-on-surface">{tablesSummary.global}</strong> mesas</span>
              <span><strong className="text-on-surface">{tablesSummary.totalCapacity}</strong> comensales totales</span>
            </div>
          )}
          {tablesSummary.overrideCount > 0 && (
            <p className="mt-1 text-xs text-primary font-medium">
              {tablesSummary.overrideCount} local{tablesSummary.overrideCount > 1 ? 'es' : ''} con mesas personalizadas
            </p>
          )}
        </SummaryCard>

        {/* Brand */}
        <SummaryCard title="Personalización" icon={<Palette size={15} />} onEdit={() => goToStep(4)}>
          <div className="flex items-start gap-3">
            {/* Color dot + name */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full shrink-0 border border-outline-variant"
                  style={{ background: brandSummary.primaryColor }}
                />
                <strong className="text-on-surface">{brandSummary.displayName}</strong>
              </div>
              {brandSummary.city && <span className="text-xs">{brandSummary.city}</span>}
              <span className="text-xs">Fuente: {brandSummary.headingFont}</span>
              <span className="text-xs font-mono text-primary">tuapp.com/r/{brandSummary.slug || '—'}</span>
            </div>
          </div>
          <div className="flex gap-3 mt-2 text-xs">
            <span>{brandSummary.hasLogo ? '✓ Logo' : '○ Sin logo'}</span>
            <span>{brandSummary.hasBanner ? '✓ Foto del local' : '○ Sin foto'}</span>
          </div>
        </SummaryCard>
      </div>

      {/* Footer */}
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={() => goToStep(4)}
          disabled={submitting}
          className="flex-1 py-3 border border-outline-variant text-on-surface rounded-lg text-sm font-semibold hover:bg-surface-container transition-all active:scale-[0.98] disabled:opacity-50"
        >
          ← Atrás
        </button>
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={!ok || submitting}
          whileHover={ok && !submitting ? { y: -1 } : {}}
          whileTap={ok && !submitting ? { scale: 0.98 } : {}}
          className="flex-2 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-on-primary"
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Creando tu agenda...
            </>
          ) : (
            <>🚀 Crear mi agenda</>
          )}
        </motion.button>
      </div>
    </div>
  )
}
