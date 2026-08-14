import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, LayoutGrid, Loader2 } from 'lucide-react'
import { useSetupWizard } from '@/features/setup/state/SetupWizardContext'
import { useSubmitStep3 } from '@/features/setup/hooks/useSubmitStep3'
import { FadeUp } from '@/features/auth/components/animations/FadeUp'
import { ScopeSelector, ScopeOverrideBanner } from '../shared/ScopeSelector'
import { TableRow } from '../tables/TableRow'
import { BulkAddPanel } from '../tables/BulkAddPanel'

export function Step3Tables() {
  const {
    venues, tables,
    addTable, addManyTables, updateTable, removeTable,
    enableTablesOverride, disableTablesOverride,
    prevStep,
  } = useSetupWizard()
  const { submit, isPending, error: submitError } = useSubmitStep3()

  const [scope, setScope] = useState<'global' | number>('global')
  const [showBulk, setShowBulk] = useState(false)
  const [errors, setErrors] = useState<Record<number, string>>({})

  const activeTables = scope === 'global'
    ? tables.global
    : (tables.overrides[scope as number] ?? tables.global)

  const hasOverride = typeof scope === 'number' && tables.overrides[scope as number] != null
  const isReadOnly = typeof scope === 'number' && !hasOverride

  const nextNumber = activeTables.length > 0
    ? Math.max(...activeTables.map(t => parseInt(t.name.replace(/\D/g, '') || '0'))) + 1
    : 1

  const validate = (): boolean => {
    const errs: Record<number, string> = {}
    const names = new Set<string>()
    for (const t of activeTables) {
      if (!t.name.trim()) {
        errs[t.id] = 'El nombre es obligatorio'
      } else if (names.has(t.name.trim().toLowerCase())) {
        errs[t.id] = 'Nombre duplicado'
      } else {
        names.add(t.name.trim().toLowerCase())
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleContinue = async () => {
    if (validate()) await submit()
  }

  return (
    <FadeUp delay={0.1}>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.4rem' }}>
        Definí tus mesas
      </h2>
      <p className="text-sm text-on-surface-variant mb-5">
        Configurá las mesas de tu local. Podés agregar varias de una vez con el nombre y capacidad por defecto.
      </p>

      <ScopeSelector venues={venues} scope={scope} onScopeChange={setScope} />

      <ScopeOverrideBanner
        scope={scope}
        hasOverride={hasOverride}
        entityLabel="Mesas"
        onEnable={() => enableTablesOverride(scope as number)}
        onDisable={() => disableTablesOverride(scope as number)}
      />

      {/* Tables list */}
      <div
        style={{
          border: '1px solid var(--color-outline-variant)',
          borderRadius: '0.875rem',
          padding: '0 1.125rem',
          background: 'white',
          marginBottom: '1rem',
          opacity: isReadOnly ? 0.5 : 1,
          pointerEvents: isReadOnly ? 'none' : 'auto',
          transition: 'opacity 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <AnimatePresence initial={false}>
          {activeTables.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 py-10 text-on-surface-variant"
            >
              <LayoutGrid size={32} className="opacity-30" />
              <p className="text-sm">Todavía no hay mesas configuradas</p>
            </motion.div>
          ) : (
            activeTables.map(table => (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
              >
                <TableRow
                  table={table}
                  onUpdate={patch => updateTable(scope, table.id, patch)}
                  onDelete={() => removeTable(scope, table.id)}
                />
                {errors[table.id] && (
                  <p className="text-[11px] text-error pb-1">{errors[table.id]}</p>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      {!isReadOnly && (
        <div className="flex gap-2 flex-wrap mb-5">
          <button
            type="button"
            onClick={() => addTable(scope, { name: `Mesa ${nextNumber}`, capacity: 4 })}
            className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container transition-all"
          >
            <Plus size={13} /> Agregar mesa
          </button>
          <button
            type="button"
            onClick={() => setShowBulk(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${showBulk ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface hover:bg-surface-container'}`}
          >
            <Plus size={13} /> Agregar varias
          </button>
        </div>
      )}

      <AnimatePresence>
        {showBulk && !isReadOnly && (
          <BulkAddPanel
            nextNumber={nextNumber}
            onConfirm={opts => {
              addManyTables(scope, opts)
              setShowBulk(false)
            }}
            onCancel={() => setShowBulk(false)}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      {submitError && (
        <div className="p-3 bg-error-container rounded-xl text-xs text-error font-medium mt-4">
          {submitError.message}
        </div>
      )}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={prevStep}
          disabled={isPending}
          className="flex-1 py-3 border border-outline-variant text-on-surface rounded-lg text-sm font-semibold hover:bg-surface-container transition-all active:scale-[0.98] disabled:opacity-50"
        >
          ← Atrás
        </button>
        <motion.button
          type="button"
          onClick={handleContinue}
          disabled={isPending}
          whileHover={!isPending ? { opacity: 0.9, y: -1 } : {}}
          whileTap={!isPending ? { scale: 0.98 } : {}}
          className="flex-2 py-3 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? <><Loader2 size={15} className="animate-spin" /> Guardando...</> : 'Continuar →'}
        </motion.button>
      </div>
    </FadeUp>
  )
}
