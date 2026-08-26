import { useEffect, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Building2, CalendarClock, Clock3, Image, LayoutGrid, Plus, Save, Store, Trash2, Users } from 'lucide-react'
import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { getRestaurantePorAdmin } from '@/features/dashboard/services/dashboardApi'
import { useCurrentUser } from '@/features/auth/store/authStore'
import { DAY_KEYS, type DayKey, type WeekSchedule, makeDefaultWeekSchedule } from '@/features/setup/state/setupTypes'
import { DayScheduleRow } from '@/features/setup/components/schedule/DayScheduleRow'
import { BulkAddPanel } from '@/features/setup/components/tables/BulkAddPanel'
import { AgendaPreview } from '@/features/setup/components/branding/AgendaPreview'
import { apiAssetUrl } from '@/shared/api/apiClient'
import { settingsApi, type ConfiguracionSucursal, type MesaSettings, type RestauranteSettings, type SucursalSettings } from './services/settingsApi'
import { DEFAULT_TIME_RANGE, toWeekSchedule } from './services/settingsMappers'
import { syncSchedules } from './services/scheduleSync'
import { useNewVenueDialogStore } from './state/newVenueDialogStore'

export type SettingsSection = 'restaurante' | 'locales' | 'horarios' | 'mesas' | 'reglas' | 'marca'

const SECTIONS: { id: SettingsSection; label: string; icon: typeof Building2 }[] = [
  { id: 'restaurante', label: 'Restaurante', icon: Building2 },
  { id: 'locales', label: 'Locales', icon: Store },
  { id: 'horarios', label: 'Horarios', icon: Clock3 },
  { id: 'mesas', label: 'Mesas', icon: LayoutGrid },
  { id: 'reglas', label: 'Reglas de reserva', icon: CalendarClock },
  { id: 'marca', label: 'Marca y agenda', icon: Image },
]

const inputClass = 'w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-dim outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15'

function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm"><h2 className="text-base font-bold text-on-surface">{title}</h2>{description && <p className="mt-1 text-xs text-on-surface-variant">{description}</p>}<div className="mt-5 grid gap-4">{children}</div></section>
}

function PendingBar({ dirty, saving, onSave, onReset }: { dirty: boolean; saving: boolean; onSave: () => void; onReset: () => void }) {
  if (!dirty) return null
  return <div className="sticky bottom-4 z-20 mt-6 flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-surface-container-lowest p-3 shadow-xl"><p className="text-sm font-medium text-on-surface"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-amber-500" />Tenés cambios sin guardar</p><div className="flex gap-2"><button onClick={onReset} className="rounded-lg px-3 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container">Descartar</button><button onClick={onSave} disabled={saving} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-on-primary disabled:opacity-60"><Save size={13} />{saving ? 'Guardando...' : 'Guardar cambios'}</button></div></div>
}

function ScopePicker({ branches, value, onChange, onApply }: { branches: SucursalSettings[]; value: number | null; onChange: (value: number) => void; onApply?: () => void }) {
  if (!branches.length) return null
  return <div className="mb-5 flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-on-surface-variant">Local:</span>{branches.map(branch => <button key={branch.id} onClick={() => onChange(branch.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${value === branch.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}><Store className="mr-1 inline" size={12} />{branch.nombre}</button>)}{onApply && <button onClick={onApply} className="ml-auto rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/5">Aplicar a otros locales</button>}</div>
}

function RestaurantSection({ restaurant }: { restaurant: RestauranteSettings }) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState(restaurant)
  useEffect(() => setDraft(restaurant), [restaurant])
  const mutation = useMutation({ mutationFn: () => settingsApi.updateRestaurant(restaurant.id, draft), onSuccess: data => queryClient.setQueryData(['settings-restaurant', restaurant.id], data) })
  const dirty = JSON.stringify(draft) !== JSON.stringify(restaurant)
  const set = (key: keyof Omit<RestauranteSettings, 'id' | 'usuarioAdminId'>, value: string) => setDraft(current => ({ ...current, [key]: value }))
  return <div className="grid gap-5"><Card title="Identidad" description="Información pública y comercial de tu restaurante."><div className="grid gap-4 md:grid-cols-2"><Field label="Nombre público" value={draft.nombrePublico} onChange={value => set('nombrePublico', value)} /><Field label="Razón social" value={draft.razonSocial ?? ''} onChange={value => set('razonSocial', value)} /><Field label="CUIT" value={draft.cuit ?? ''} onChange={value => set('cuit', value)} /><Field label="Tipo de cocina" value={draft.tipoCocina ?? ''} onChange={value => set('tipoCocina', value)} /><Field label="Ciudad" value={draft.ciudadPrincipal ?? ''} onChange={value => set('ciudadPrincipal', value)} /><Field label="Email comercial" type="email" value={draft.emailComercial ?? ''} onChange={value => set('emailComercial', value)} /></div><Field label="Slogan" value={draft.slogan ?? ''} onChange={value => set('slogan', value)} /><label className="grid gap-1 text-xs font-semibold text-on-surface-variant">Descripción<textarea className={inputClass} rows={3} value={draft.descripcion ?? ''} onChange={event => set('descripcion', event.target.value)} /></label></Card><Card title="URL pública" description="Cambiarla modifica el enlace para recibir reservas."><div className="max-w-xl"><Field label="tuapp.com/r/" value={draft.slugPublico} onChange={value => set('slugPublico', value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} /></div></Card><PendingBar dirty={dirty} saving={mutation.isPending} onSave={() => mutation.mutate()} onReset={() => setDraft(restaurant)} /></div>
}

function BranchesSection({ restaurantId, branches }: { restaurantId: number; branches: SucursalSettings[] }) {
  const queryClient = useQueryClient()
  const openNewVenue = useNewVenueDialogStore((state) => state.open)
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['settings-branches', restaurantId] })
  const update = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<SucursalSettings> }) => settingsApi.updateBranch(id, data), onSuccess: refresh })
  const remove = useMutation({ mutationFn: settingsApi.deleteBranch, onSuccess: refresh })
  const principal = useMutation({ mutationFn: settingsApi.makePrincipal, onSuccess: refresh })
  return <div className="grid gap-5"><Card title="Tus locales" description="Administrá direcciones, contactos y cuál es tu local principal.">{branches.map(branch => <div key={branch.id} className="rounded-xl border border-outline-variant p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-on-surface">{branch.nombre}</p><p className="mt-1 text-xs text-on-surface-variant">{branch.direccion}</p></div>{branch.esPrincipal ? <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary">Principal</span> : <button onClick={() => principal.mutate(branch.id)} className="text-xs font-bold text-primary">Hacer principal</button>}</div><div className="mt-4 grid gap-3 md:grid-cols-3"><Field label="Nombre" value={branch.nombre} onBlur={value => update.mutate({ id: branch.id, data: { nombre: value } })} /><Field label="Dirección" value={branch.direccion} onBlur={value => update.mutate({ id: branch.id, data: { direccion: value } })} /><Field label="Teléfono" value={branch.telefono ?? ''} onBlur={value => update.mutate({ id: branch.id, data: { telefono: value } })} /></div>{!branch.esPrincipal && <button onClick={() => window.confirm(`¿Eliminar ${branch.nombre}?`) && remove.mutate(branch.id)} className="mt-3 flex items-center gap-1 text-xs font-bold text-error"><Trash2 size={13} />Eliminar local</button>}</div>)}{!branches.length && <p className="rounded-xl bg-surface-container p-6 text-center text-sm text-on-surface-variant">Todavía no hay locales configurados.</p>}</Card><Card title="Agregar local" description="Creá un local operativo con horarios, mesas y reglas copiadas de otro local."><button onClick={openNewVenue} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-on-primary"><Plus size={14} />Agregar local guiado</button></Card></div>
}

function SchedulesSection({ branchId, branches, onBranchChange }: { branchId: number; branches: SucursalSettings[]; onBranchChange: (id: number) => void }) {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['settings-schedules', branchId], queryFn: () => settingsApi.getSchedules(branchId) })
  const [draft, setDraft] = useState<WeekSchedule>(makeDefaultWeekSchedule())
  const [copySourceId, setCopySourceId] = useState<number | null>(null)

  useEffect(() => { if (query.data) setDraft(toWeekSchedule(query.data)) }, [query.data])

  const mutation = useMutation({
    mutationFn: () => syncSchedules(branchId, query.data ?? [], draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings-schedules', branchId] }),
  })
  const applyToOthers = useMutation({
    mutationFn: async () => Promise.all(branches.filter(branch => branch.id !== branchId).map(async branch => {
      const current = await settingsApi.getSchedules(branch.id)
      await syncSchedules(branch.id, current, draft)
    })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings-schedules'] }),
  })

  const dirty = query.data !== undefined && JSON.stringify(draft) !== JSON.stringify(toWeekSchedule(query.data))
  const allDaysClosed = DAY_KEYS.every(day => !draft[day].enabled)
  const sourceBranches = branches.filter(branch => branch.id !== branchId)
  const update = (day: DayKey, fn: (value: WeekSchedule[DayKey]) => WeekSchedule[DayKey]) => setDraft(current => ({ ...current, [day]: fn(current[day]) }))
  const applyWeekdayPreset = () => setDraft(current => Object.fromEntries(DAY_KEYS.map((day, index) => [day, {
    enabled: ['mon', 'tue', 'wed', 'thu', 'fri'].includes(day),
    ranges: ['mon', 'tue', 'wed', 'thu', 'fri'].includes(day) ? [{ id: -(index + 1), ...DEFAULT_TIME_RANGE }] : current[day].ranges,
  }])) as WeekSchedule)
  const copyFromBranch = async () => {
    if (!copySourceId) return
    setDraft(toWeekSchedule(await settingsApi.getSchedules(copySourceId)))
  }

  return <div>
    <ScopePicker branches={branches} value={branchId} onChange={onBranchChange} onApply={() => window.confirm('¿Aplicar estos horarios a todos los demás locales?') && applyToOthers.mutate()} />
    <Card title="Horarios de atención" description="Activá un día para agregar hasta tres turnos.">
      {allDaysClosed && <div className="rounded-xl border border-primary/20 bg-primary/5 p-4"><p className="font-bold text-on-surface">Este local todavía no tiene horarios</p><p className="mt-1 text-sm text-on-surface-variant">Podés abrir días individuales, usar una plantilla o copiar la agenda de otro local.</p><div className="mt-4 flex flex-wrap items-center gap-2"><button type="button" onClick={applyWeekdayPreset} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-on-primary transition-opacity hover:opacity-90">Configurar lunes a viernes</button>{sourceBranches.length > 0 && <><select value={copySourceId ?? ''} onChange={event => setCopySourceId(event.target.value ? Number(event.target.value) : null)} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-xs font-semibold text-on-surface"><option value="">Elegí un local para copiar</option>{sourceBranches.map(branch => <option key={branch.id} value={branch.id}>{branch.nombre}</option>)}</select><button type="button" disabled={!copySourceId} onClick={copyFromBranch} className="rounded-lg border border-outline-variant px-3 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50">Copiar horarios</button></>}</div></div>}
      {DAY_KEYS.map(day => <DayScheduleRow key={day} day={day} schedule={draft[day]} rangeErrors={{}} onToggle={enabled => update(day, value => ({ ...value, enabled, ranges: enabled && value.ranges.length === 0 ? [{ id: Date.now(), ...DEFAULT_TIME_RANGE }] : value.ranges }))} onTimeChange={(id, field, value) => update(day, current => ({ ...current, ranges: current.ranges.map(range => range.id === id ? { ...range, [field]: value } : range) }))} onAddRange={() => update(day, current => ({ ...current, ranges: [...current.ranges, { id: Date.now(), open: '20:00', close: '23:00' }] }))} onRemoveRange={id => update(day, current => ({ ...current, ranges: current.ranges.filter(range => range.id !== id) }))} onCopy={days => setDraft(current => ({ ...current, ...Object.fromEntries(days.map(target => [target, { ...current[day], ranges: current[day].ranges.map((range, index) => ({ ...range, id: Date.now() + index })) }])) }))} />)}
    </Card>
    {mutation.error && <p className="mt-3 rounded-xl bg-error-container p-3 text-sm font-medium text-error">No se pudieron guardar los horarios: {mutation.error.message}</p>}
    {applyToOthers.error && <p className="mt-3 rounded-xl bg-error-container p-3 text-sm font-medium text-error">No se pudieron copiar los horarios: {applyToOthers.error.message}</p>}
    <PendingBar dirty={dirty} saving={mutation.isPending} onSave={() => mutation.mutate()} onReset={() => query.data && setDraft(toWeekSchedule(query.data))} />
  </div>
}

function TablesSection({ branchId, branches, onBranchChange }: { branchId: number; branches: SucursalSettings[]; onBranchChange: (id: number) => void }) {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['settings-tables', branchId], queryFn: () => settingsApi.getTables(branchId) })
  const [bulk, setBulk] = useState(false)
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['settings-tables', branchId] })
  const update = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<MesaSettings> }) => settingsApi.updateTable(id, data), onSuccess: refresh })
  const remove = useMutation({ mutationFn: settingsApi.deleteTable, onSuccess: refresh })
  const add = useMutation({ mutationFn: settingsApi.createTables, onSuccess: refresh })
  const tables = query.data ?? []
  const next = tables.length ? Math.max(...tables.map(table => Number(table.nombre.replace(/\D/g, '')) || 0)) + 1 : 1
  return <div><ScopePicker branches={branches} value={branchId} onChange={onBranchChange} /><Card title="Mesas" description="Las altas y bajas se guardan en el momento.">{tables.map(table => <div key={table.id} className="grid items-end gap-2 border-b border-outline-variant py-3 last:border-0 md:grid-cols-[1fr_100px_1fr_auto]"><Field label="Nombre" value={table.nombre} onBlur={nombre => update.mutate({ id: table.id, data: { nombre } })} /><Field label="Capacidad" type="number" value={String(table.capacidad)} onBlur={capacidad => update.mutate({ id: table.id, data: { capacidad: Number(capacidad) } })} /><Field label="Ubicación" value={table.ubicacion ?? ''} onBlur={ubicacion => update.mutate({ id: table.id, data: { ubicacion } })} /><button onClick={() => window.confirm(`¿Eliminar ${table.nombre}?`) && remove.mutate(table.id)} className="mb-2 rounded-lg p-2 text-error hover:bg-error-container"><Trash2 size={15} /></button></div>)}{!tables.length && <p className="py-8 text-center text-sm text-on-surface-variant">Todavía no hay mesas configuradas.</p>}<div className="mt-4 flex gap-2"><button onClick={() => add.mutate([{ sucursalId: branchId, nombre: `Mesa ${next}`, capacidad: 4, ubicacion: null }])} className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-xs font-bold text-on-surface"><Plus size={13} />Agregar mesa</button><button onClick={() => setBulk(value => !value)} className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-xs font-bold text-on-surface"><Users size={13} />Agregar varias</button></div>{bulk && <BulkAddPanel nextNumber={next} onCancel={() => setBulk(false)} onConfirm={options => { add.mutate(Array.from({ length: options.count }, (_, index) => ({ sucursalId: branchId, nombre: `${options.prefix} ${options.startNumber + index}`, capacidad: options.capacity, ubicacion: null }))); setBulk(false) }} />}</Card></div>
}

function RulesSection({ branchId, branches, onBranchChange }: { branchId: number; branches: SucursalSettings[]; onBranchChange: (id: number) => void }) {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['settings-rules', branchId], queryFn: () => settingsApi.getReservationRules(branchId) })
  const [draft, setDraft] = useState<ConfiguracionSucursal | null>(null)
  useEffect(() => setDraft(query.data ?? null), [query.data])
  const mutation = useMutation({ mutationFn: () => settingsApi.updateReservationRules(branchId, draft!), onSuccess: data => queryClient.setQueryData(['settings-rules', branchId], data) })
  const applyToOthers = useMutation({ mutationFn: () => Promise.all(branches.filter(branch => branch.id !== branchId).map(branch => settingsApi.updateReservationRules(branch.id, draft!))), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings-rules'] }) })
  if (!draft) return <div className="p-6 text-sm text-on-surface-variant">Cargando reglas...</div>
  const dirty = JSON.stringify(draft) !== JSON.stringify(query.data)
  const set = (key: keyof ConfiguracionSucursal, value: string | boolean) => setDraft(current => current ? ({ ...current, [key]: typeof value === 'string' ? Number(value) : value } as ConfiguracionSucursal) : current)
  return <div><ScopePicker branches={branches} value={branchId} onChange={onBranchChange} onApply={() => window.confirm('¿Aplicar estas reglas a todos los demás locales?') && applyToOthers.mutate()} /><div className="grid gap-5"><Card title="Reservas"><Toggle label="Confirmar reservas automáticamente" checked={draft.confirmacionAutomatica} onChange={value => set('confirmacionAutomatica', value)} /><Toggle label="Habilitar lista de espera" checked={draft.habilitarListaEspera} onChange={value => set('habilitarListaEspera', value)} /><div className="grid gap-4 md:grid-cols-3"><NumberField label="Mínimo de personas" value={draft.minPersonasPorReserva} onChange={value => set('minPersonasPorReserva', value)} /><NumberField label="Máximo de personas" value={draft.maxPersonasPorReserva} onChange={value => set('maxPersonasPorReserva', value)} /><NumberField label="Anticipación máxima (días)" value={draft.diasAnticipacionMaxima} onChange={value => set('diasAnticipacionMaxima', value)} /></div></Card><Card title="Seña y cancelaciones"><Toggle label="Cobrar seña" checked={draft.cobrarSenia} onChange={value => set('cobrarSenia', value)} /><div className="grid gap-4 md:grid-cols-3"><NumberField label="Monto de seña" value={draft.montoSenia} onChange={value => set('montoSenia', value)} /><NumberField label="Bloqueo de pago (min.)" value={draft.minutosLockPago} onChange={value => set('minutosLockPago', value)} /><NumberField label="Cancelación libre (horas)" value={draft.horasCancelacionLibre} onChange={value => set('horasCancelacionLibre', value)} /></div></Card><Card title="Tiempos y asistencia"><div className="grid gap-4 md:grid-cols-3"><NumberField label="Tolerancia (min.)" value={draft.toleranciaMinutos} onChange={value => set('toleranciaMinutos', value)} /><NumberField label="Duración almuerzo (min.)" value={draft.duracionAlmuerzoMinutos} onChange={value => set('duracionAlmuerzoMinutos', value)} /><NumberField label="Duración cena (min.)" value={draft.duracionCenaMinutos} onChange={value => set('duracionCenaMinutos', value)} /><NumberField label="Recordatorio (min.)" value={draft.minutosRecordatorio} onChange={value => set('minutosRecordatorio', value)} /><NumberField label="Límite de no-shows" value={draft.umbralNoShowsBloqueo} onChange={value => set('umbralNoShowsBloqueo', value)} /></div></Card></div><PendingBar dirty={dirty} saving={mutation.isPending} onSave={() => mutation.mutate()} onReset={() => setDraft(query.data ?? null)} /></div>
}

function BrandSection({ restaurant }: { restaurant: RestauranteSettings }) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState(restaurant)
  useEffect(() => setDraft(restaurant), [restaurant])
  const save = useMutation({ mutationFn: () => settingsApi.updateRestaurant(restaurant.id, draft), onSuccess: data => queryClient.setQueryData(['settings-restaurant', restaurant.id], data) })
  const upload = useMutation({ mutationFn: ({ type, file }: { type: 'LOGO' | 'BANNER'; file: File }) => settingsApi.uploadRestaurantImage(restaurant.id, type, file), onSuccess: data => { queryClient.setQueryData(['settings-restaurant', restaurant.id], data); setDraft(data) } })
  const removeImage = useMutation({ mutationFn: (type: 'LOGO' | 'BANNER') => settingsApi.deleteRestaurantImage(restaurant.id, type), onSuccess: data => { queryClient.setQueryData(['settings-restaurant', restaurant.id], data); setDraft(data) } })
  const dirty = JSON.stringify(draft) !== JSON.stringify(restaurant)
  const set = (key: keyof Omit<RestauranteSettings, 'id' | 'usuarioAdminId'>, value: string) => setDraft(current => ({ ...current, [key]: value }))
  const brand = { logoDataUrl: apiAssetUrl(draft.logoUrl) ?? null, bannerDataUrl: apiAssetUrl(draft.fotoLocalUrl) ?? null, primaryColor: draft.colorPrimario ?? '#005759', accentColor: draft.colorAcento ?? '#07a7a9', headingFont: (draft.tipografiaTitulos ?? 'PLAYFAIR').toLowerCase().replace('dm_sans', 'dm-sans') as 'sora' | 'playfair' | 'inter' | 'dm-sans', bodyFont: (draft.tipografiaCuerpo ?? 'INTER').toLowerCase().replace('dm_sans', 'dm-sans') as 'sora' | 'playfair' | 'inter' | 'dm-sans', borderRadius: ({ MINIMAL: 'minimal', SUAVE: 'soft', REDONDO: 'rounded' } as Record<string, 'minimal' | 'soft' | 'rounded'>)[draft.estiloBordes ?? 'SUAVE'], instagram: draft.instagramUrl ?? '', facebook: draft.facebookUrl ?? '', website: draft.sitioWeb ?? '' }
  return <div className="grid gap-5 lg:grid-cols-2"><div className="grid gap-5"><Card title="Imágenes"><ImageField label="Logo" value={draft.logoUrl} onFile={file => upload.mutate({ type: 'LOGO', file })} onRemove={() => removeImage.mutate('LOGO')} /><ImageField label="Foto del local" value={draft.fotoLocalUrl} onFile={file => upload.mutate({ type: 'BANNER', file })} onRemove={() => removeImage.mutate('BANNER')} /></Card><Card title="Estética"><div className="grid gap-4 md:grid-cols-2"><Field label="Color primario" value={draft.colorPrimario ?? ''} onChange={value => set('colorPrimario', value)} /><Field label="Color acento" value={draft.colorAcento ?? ''} onChange={value => set('colorAcento', value)} /><SelectField label="Tipografía de títulos" value={draft.tipografiaTitulos ?? 'PLAYFAIR'} onChange={value => set('tipografiaTitulos', value)} options={['PLAYFAIR', 'SORA', 'INTER', 'DM_SANS']} /><SelectField label="Tipografía de cuerpo" value={draft.tipografiaCuerpo ?? 'INTER'} onChange={value => set('tipografiaCuerpo', value)} options={['PLAYFAIR', 'SORA', 'INTER', 'DM_SANS']} /></div></Card><Card title="Redes sociales"><Field label="Instagram" value={draft.instagramUrl ?? ''} onChange={value => set('instagramUrl', value)} /><Field label="Facebook" value={draft.facebookUrl ?? ''} onChange={value => set('facebookUrl', value)} /><Field label="Sitio web" value={draft.sitioWeb ?? ''} onChange={value => set('sitioWeb', value)} /></Card></div><Card title="Vista previa de agenda"><AgendaPreview brand={brand} restaurant={{ nombrePublico: draft.nombrePublico, razonSocial: draft.razonSocial ?? '', cuit: draft.cuit ?? '', tipoCocina: draft.tipoCocina ?? '', ciudadPrincipal: draft.ciudadPrincipal ?? '', descripcion: draft.descripcion ?? '', slogan: draft.slogan ?? '', emailComercial: draft.emailComercial ?? '', slug: draft.slugPublico }} /></Card><div className="lg:col-span-2"><PendingBar dirty={dirty} saving={save.isPending || upload.isPending} onSave={() => save.mutate()} onReset={() => setDraft(restaurant)} /></div></div>
}

export function SettingsPage({ section }: { section: SettingsSection }) {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const restaurantLookup = useQuery({ queryKey: ['restaurante-by-admin', user?.id], queryFn: () => getRestaurantePorAdmin(user!.id), enabled: !!user?.id })
  const restaurantId = restaurantLookup.data?.id
  const restaurant = useQuery({ queryKey: ['settings-restaurant', restaurantId], queryFn: () => settingsApi.getRestaurant(restaurantId!), enabled: !!restaurantId })
  const branches = useQuery({ queryKey: ['settings-branches', restaurantId], queryFn: () => settingsApi.getBranches(restaurantId!), enabled: !!restaurantId })
  const [branchId, setBranchId] = useState<number | null>(null)
  useEffect(() => { if (!branchId && branches.data?.length) setBranchId(branches.data.find(branch => branch.esPrincipal)?.id ?? branches.data[0].id) }, [branchId, branches.data])
  return <DashboardShell><div className="flex-1 overflow-y-auto"><div className="mx-auto max-w-7xl p-4 md:p-6"><div className="mb-6"><h1 className="text-2xl font-bold text-on-surface">Configuración</h1><p className="mt-1 text-sm text-on-surface-variant">Personalizá tu restaurante, agenda y reglas de reserva.</p></div>{restaurant.isLoading || branches.isLoading ? <div className="h-64 animate-pulse rounded-2xl bg-surface-container" /> : !restaurant.data ? <Card title="Terminá la configuración inicial" description="Necesitás crear tu restaurante antes de editar su configuración."><button onClick={() => navigate({ to: '/setup' })} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-on-primary">Ir al setup</button></Card> : <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8"><nav className="mb-5 flex gap-2 overflow-x-auto lg:sticky lg:top-0 lg:mb-0 lg:h-fit lg:flex-col">{SECTIONS.map(item => <button key={item.id} onClick={() => navigate({ to: `/dashboard/configuracion/${item.id}` })} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold ${section === item.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}><item.icon size={16} />{item.label}</button>)}</nav><div>{section === 'restaurante' && <RestaurantSection restaurant={restaurant.data} />}{section === 'locales' && <BranchesSection restaurantId={restaurant.data.id} branches={branches.data ?? []} />}{branchId && section === 'horarios' && <SchedulesSection branchId={branchId} branches={branches.data ?? []} onBranchChange={setBranchId} />}{branchId && section === 'mesas' && <TablesSection branchId={branchId} branches={branches.data ?? []} onBranchChange={setBranchId} />}{branchId && section === 'reglas' && <RulesSection branchId={branchId} branches={branches.data ?? []} onBranchChange={setBranchId} />}{section === 'marca' && <BrandSection restaurant={restaurant.data} />}{!branchId && ['horarios', 'mesas', 'reglas'].includes(section) && <p className="text-sm text-on-surface-variant">Agregá un local para administrar esta sección.</p>}</div></div>}</div></div></DashboardShell>
}

function Field({ label, value, onChange, onBlur, type = 'text' }: { label: string; value: string; onChange?: (value: string) => void; onBlur?: (value: string) => void; type?: string }) { const [local, setLocal] = useState(value); useEffect(() => setLocal(value), [value]); return <label className="grid gap-1 text-xs font-semibold text-on-surface-variant">{label}<input type={type} className={inputClass} value={local} onChange={event => { setLocal(event.target.value); onChange?.(event.target.value) }} onBlur={() => onBlur?.(local)} /></label> }
function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: string) => void }) { return <Field label={label} type="number" value={String(value)} onChange={onChange} /> }
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="grid gap-1 text-xs font-semibold text-on-surface-variant">{label}<select value={value} onChange={event => onChange(event.target.value)} className={inputClass}>{options.map(option => <option key={option}>{option}</option>)}</select></label> }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex items-center justify-between gap-3 text-sm font-medium text-on-surface"><span>{label}</span><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="h-4 w-4 accent-primary" /></label> }
function ImageField({ label, value, onFile, onRemove }: { label: string; value: string | null; onFile: (file: File) => void; onRemove: () => void }) { return <label className="grid gap-2 text-xs font-semibold text-on-surface-variant">{label}{value && <><img src={apiAssetUrl(value)} alt={label} className="h-28 w-full rounded-xl object-cover" /><button type="button" onClick={onRemove} className="w-fit text-xs font-bold text-error">Eliminar imagen</button></>}<input type="file" accept="image/*" onChange={event => event.target.files?.[0] && onFile(event.target.files[0])} className="text-xs" /></label> }
