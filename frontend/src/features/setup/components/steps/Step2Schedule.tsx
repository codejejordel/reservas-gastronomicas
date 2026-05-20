import { useState } from 'react'
import { motion } from 'motion/react'
import { useSetupWizard } from '@/features/setup/state/SetupWizardContext'
import { DAY_KEYS } from '@/features/setup/state/setupTypes'
import { FadeUp } from '@/features/auth/components/animations/FadeUp'
import { DayScheduleRow } from '../schedule/DayScheduleRow'
import { ScopeSelector, ScopeOverrideBanner } from '../shared/ScopeSelector'

function validateSchedule(schedule: ReturnType<typeof useSetupWizard>['schedule']['global']): Record<string, Record<number, string>> {
  const errors: Record<string, Record<number, string>> = {}
  for (const day of DAY_KEYS) {
    const { enabled, ranges } = schedule[day]
    if (!enabled) continue
    const dayErrors: Record<number, string> = {}
    ranges.forEach(r => {
      if (r.open >= r.close) {
        dayErrors[r.id] = 'El cierre debe ser posterior a la apertura'
      }
    })
    if (Object.keys(dayErrors).length) errors[day] = dayErrors
  }
  return errors
}

export function Step2Schedule() {
  const { venues, schedule, setDayEnabled, setTimeRange, addTimeRange, removeTimeRange, copyDay, enableOverride, disableOverride, nextStep, prevStep } = useSetupWizard()

  const [scope, setScope] = useState<'global' | number>('global')
  const [errors, setErrors] = useState<Record<string, Record<number, string>>>({})

  const activeSchedule = scope === 'global'
    ? schedule.global
    : (schedule.overrides[scope as number] ?? schedule.global)

  const hasOverride = typeof scope === 'number' && schedule.overrides[scope as number] != null

  const handleContinue = () => {
    const errs = validateSchedule(activeSchedule)
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    nextStep()
  }

  return (
    <FadeUp delay={0.1}>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.4rem' }}>
        Definí tus horarios
      </h2>
      <p className="text-sm text-on-surface-variant mb-5">
        Estos horarios aplican a todos tus locales. Después podés ajustar cada uno si tiene horarios distintos.
      </p>

      <ScopeSelector venues={venues} scope={scope} onScopeChange={setScope} />

      <ScopeOverrideBanner
        scope={scope}
        hasOverride={hasOverride}
        entityLabel="Horarios"
        onEnable={() => enableOverride(scope as number)}
        onDisable={() => disableOverride(scope as number)}
      />

      {/* Days list */}
      <div style={{ border: '1px solid var(--color-outline-variant)', borderRadius: '0.875rem', padding: '0 1.125rem', background: 'white', marginBottom: '1.5rem', opacity: (typeof scope === 'number' && !hasOverride) ? 0.5 : 1, pointerEvents: (typeof scope === 'number' && !hasOverride) ? 'none' : 'auto', transition: 'opacity 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {DAY_KEYS.map(day => (
          <DayScheduleRow
            key={day}
            day={day}
            schedule={activeSchedule[day]}
            rangeErrors={errors[day] ?? {}}
            onToggle={enabled => setDayEnabled(scope, day, enabled)}
            onTimeChange={(rid, field, val) => setTimeRange(scope, day, rid, field, val)}
            onAddRange={() => addTimeRange(scope, day)}
            onRemoveRange={rid => removeTimeRange(scope, day, rid)}
            onCopy={toDays => copyDay(scope, day, toDays)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex gap-3">
        <button type="button" onClick={prevStep}
          className="flex-1 py-3 border border-outline-variant text-on-surface rounded-lg text-sm font-semibold hover:bg-surface-container transition-all active:scale-[0.98]">
          ← Atrás
        </button>
        <motion.button type="button" onClick={handleContinue}
          whileHover={{ opacity: 0.9, y: -1 }} whileTap={{ scale: 0.98 }}
          className="flex-2 py-3 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
          Continuar →
        </motion.button>
      </div>
    </FadeUp>
  )
}
