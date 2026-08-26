import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Plus, Store, X } from 'lucide-react'
import { DAY_KEYS, type DayKey, type Table, type WeekSchedule, makeDefaultWeekSchedule } from '@/features/setup/state/setupTypes'
import { DayScheduleRow } from '@/features/setup/components/schedule/DayScheduleRow'
import { BulkAddPanel } from '@/features/setup/components/tables/BulkAddPanel'
import { getRestaurantePorAdmin } from '@/features/dashboard/services/dashboardApi'
import { useCurrentUser } from '@/features/auth/store/authStore'
import { settingsApi } from '../services/settingsApi'
import { toWeekSchedule } from '../services/settingsMappers'
import { useNewVenueDialogStore } from '../state/newVenueDialogStore'
import { useCreateVenue } from '../hooks/useCreateVenue'

const steps = ['Datos', 'Horarios', 'Mesas']

function cloneSchedule(schedule: WeekSchedule) {
  return Object.fromEntries(DAY_KEYS.map(day => [day, {
    enabled: schedule[day].enabled,
    ranges: schedule[day].ranges.map(range => ({ ...range, id: Date.now() + Math.random() })),
  }])) as WeekSchedule
}

function ScheduleEditor({ schedule, onChange }: { schedule: WeekSchedule; onChange: (value: WeekSchedule) => void }) {
  const update = (day: DayKey, callback: (value: WeekSchedule[DayKey]) => WeekSchedule[DayKey]) => onChange({ ...schedule, [day]: callback(schedule[day]) })
  return <div className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4">{DAY_KEYS.map(day => <DayScheduleRow key={day} day={day} schedule={schedule[day]} rangeErrors={{}} onToggle={enabled => update(day, value => ({ ...value, enabled }))} onTimeChange={(id, field, value) => update(day, current => ({ ...current, ranges: current.ranges.map(range => range.id === id ? { ...range, [field]: value } : range) }))} onAddRange={() => update(day, current => ({ ...current, ranges: [...current.ranges, { id: Date.now(), open: '20:00', close: '23:00' }] }))} onRemoveRange={id => update(day, current => ({ ...current, ranges: current.ranges.filter(range => range.id !== id) }))} onCopy={days => onChange({ ...schedule, ...Object.fromEntries(days.map(target => [target, { enabled: schedule[day].enabled, ranges: schedule[day].ranges.map(range => ({ ...range, id: Date.now() + Math.random() })) }])) })} />)}</div>
}

function TablesEditor({ tables, onChange }: { tables: Table[]; onChange: (tables: Table[]) => void }) {
  const [bulk, setBulk] = useState(false)
  const next = tables.length ? Math.max(...tables.map(table => Number(table.name.replace(/\D/g, '')) || 0)) + 1 : 1
  return <div><div className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4">{tables.length ? tables.map(table => <div key={table.id} className="flex gap-2 border-b border-outline-variant py-3 last:border-0"><input value={table.name} onChange={event => onChange(tables.map(item => item.id === table.id ? { ...item, name: event.target.value } : item))} className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface" /><input type="number" min={1} value={table.capacity} onChange={event => onChange(tables.map(item => item.id === table.id ? { ...item, capacity: Math.max(1, Number(event.target.value)) } : item))} className="w-20 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface" /><button onClick={() => onChange(tables.filter(item => item.id !== table.id))} className="px-2 text-xs font-bold text-error">Quitar</button></div>) : <p className="py-8 text-center text-sm text-on-surface-variant">No hay mesas para copiar.</p>}</div><div className="mt-3 flex gap-2"><button onClick={() => onChange([...tables, { id: Date.now(), name: `Mesa ${next}`, capacity: 4 }])} className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-xs font-bold"><Plus size={13} />Agregar mesa</button><button onClick={() => setBulk(value => !value)} className="rounded-lg border border-outline-variant px-3 py-2 text-xs font-bold">Agregar varias</button></div>{bulk && <BulkAddPanel nextNumber={next} onCancel={() => setBulk(false)} onConfirm={options => { onChange([...tables, ...Array.from({ length: options.count }, (_, index) => ({ id: Date.now() + index, name: `${options.prefix} ${options.startNumber + index}`, capacity: options.capacity }))]); setBulk(false) }} />}</div>
}

export function NewVenueDialog() {
  const isOpen = useNewVenueDialogStore(state => state.isOpen)
  const close = useNewVenueDialogStore(state => state.close)
  const user = useCurrentUser()
  const restaurantQuery = useQuery({ queryKey: ['restaurante-by-admin', user?.id], queryFn: () => getRestaurantePorAdmin(user!.id), enabled: isOpen && !!user?.id })
  const restaurantId = restaurantQuery.data?.id
  const branchesQuery = useQuery({ queryKey: ['settings-branches', restaurantId], queryFn: () => settingsApi.getBranches(restaurantId!), enabled: isOpen && !!restaurantId })
  const branches = branchesQuery.data ?? []
  const [step, setStep] = useState(0)
  const [sourceId, setSourceId] = useState<number | null>(null)
  const [data, setData] = useState({ nombre: '', direccion: '', telefono: '', ciudad: '', capacidadMaxima: '' })
  const source = branches.find(branch => branch.id === sourceId)
  const templateQuery = useQuery({
    queryKey: ['venue-template', sourceId],
    queryFn: async () => ({
      schedules: await settingsApi.getSchedules(sourceId!),
      tables: await settingsApi.getTables(sourceId!),
      rules: await settingsApi.getReservationRules(sourceId!),
    }),
    enabled: isOpen && !!sourceId,
  })
  const [schedule, setSchedule] = useState<WeekSchedule>(makeDefaultWeekSchedule())
  const [tables, setTables] = useState<Table[]>([])
  const create = useCreateVenue()

  useEffect(() => {
    if (isOpen && branches.length && !sourceId) setSourceId(branches.find(branch => branch.esPrincipal)?.id ?? branches[0].id)
  }, [isOpen, branches, sourceId])
  useEffect(() => {
    if (!templateQuery.data) return
    setSchedule(cloneSchedule(toWeekSchedule(templateQuery.data.schedules)))
    setTables(templateQuery.data.tables.map((table, index) => ({ id: Date.now() + index, name: table.nombre, capacity: table.capacidad })))
  }, [templateQuery.data])
  useEffect(() => {
    if (!isOpen) {
      setStep(0)
      setSourceId(null)
      setData({ nombre: '', direccion: '', telefono: '', ciudad: '', capacidadMaxima: '' })
      setSchedule(makeDefaultWeekSchedule())
      setTables([])
    }
  }, [isOpen])

  if (!isOpen) return null
  const canContinue = step > 0 || data.nombre.trim().length > 0
  const submit = () => {
    if (!restaurantId) return
    create.mutate({ restaurantId, branches, ...data, capacidadMaxima: data.capacidadMaxima ? Number(data.capacidadMaxima) : null, schedule, tables, rules: templateQuery.data?.rules ?? null }, { onSuccess: result => { if (result.errors.length) window.alert(`El local se creó, pero no se pudieron guardar ${result.errors.join(', ')}.`); close() } })
  }

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Nuevo local"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-surface-container-lowest shadow-2xl"><header className="flex items-start justify-between border-b border-outline-variant p-5"><div><h2 className="text-xl font-bold text-on-surface">Nuevo local</h2><div className="mt-3 flex gap-2">{steps.map((label, index) => <span key={label} className={`rounded-full px-2.5 py-1 text-xs font-bold ${index === step ? 'bg-primary text-on-primary' : index < step ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>{index + 1}. {label}</span>)}</div></div><button onClick={close} className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"><X size={18} /></button></header><div className="p-5">{(restaurantQuery.isLoading || branchesQuery.isLoading) ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" /></div> : <><div className="mb-5 flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-2 text-xs text-on-primary-container"><Store size={14} />{source ? <>Copiando la configuración de <strong>{source.nombre}</strong></> : 'El local usará la configuración inicial.'}{branches.length > 1 && <select value={sourceId ?? ''} onChange={event => setSourceId(Number(event.target.value))} className="ml-auto rounded-md border border-outline-variant bg-surface-container-lowest px-2 py-1 text-xs text-on-surface">{branches.map(branch => <option key={branch.id} value={branch.id}>{branch.nombre}</option>)}</select>}</div>{step === 0 && <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-1 text-sm font-semibold">Nombre del local *<input autoFocus value={data.nombre} onChange={event => setData(current => ({ ...current, nombre: event.target.value }))} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-on-surface placeholder:text-on-surface-dim" placeholder="Ej: Palermo" /></label><label className="grid gap-1 text-sm font-semibold">Dirección<input value={data.direccion} onChange={event => setData(current => ({ ...current, direccion: event.target.value }))} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-on-surface placeholder:text-on-surface-dim" /></label><label className="grid gap-1 text-sm font-semibold">Teléfono<input value={data.telefono} onChange={event => setData(current => ({ ...current, telefono: event.target.value }))} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-on-surface placeholder:text-on-surface-dim" /></label><label className="grid gap-1 text-sm font-semibold">Ciudad<input value={data.ciudad} onChange={event => setData(current => ({ ...current, ciudad: event.target.value }))} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-on-surface placeholder:text-on-surface-dim" /></label><label className="grid gap-1 text-sm font-semibold">Capacidad máxima<input type="number" min={0} value={data.capacidadMaxima} onChange={event => setData(current => ({ ...current, capacidadMaxima: event.target.value }))} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-on-surface placeholder:text-on-surface-dim" /></label></div>}{step === 1 && <ScheduleEditor schedule={schedule} onChange={setSchedule} />}{step === 2 && <TablesEditor tables={tables} onChange={setTables} />}</>}</div><footer className="flex items-center justify-between border-t border-outline-variant p-5"><button onClick={() => step === 0 ? close() : setStep(current => current - 1)} className="rounded-lg px-3 py-2 text-sm font-bold text-on-surface-variant">{step === 0 ? 'Cancelar' : 'Atrás'}</button>{step < 2 ? <button disabled={!canContinue} onClick={() => setStep(current => current + 1)} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-50">Continuar</button> : <button disabled={create.isPending} onClick={submit} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-50">{create.isPending && <Loader2 size={15} className="animate-spin" />}Crear local</button>}</footer></div></div>
}
