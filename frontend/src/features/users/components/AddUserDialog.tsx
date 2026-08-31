import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from 'react'
import { UserPlus, X } from 'lucide-react'
import type { NewDashboardUser, UserRole } from '../types'

interface AddUserDialogProps {
  branches: string[]
  existingEmails: string[]
  returnFocusRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
  onSubmit: (user: NewDashboardUser) => void
}

type FormErrors = Partial<Record<keyof NewDashboardUser, string>>

const inputClass =
  'min-h-11 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-dim focus:border-primary focus:ring-2 focus:ring-primary/20'

export function AddUserDialog({
  branches,
  existingEmails,
  returnFocusRef,
  onClose,
  onSubmit,
}: AddUserDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const closeDialog = useEffectEvent(onClose)
  const [form, setForm] = useState<NewDashboardUser>({
    fullName: '',
    email: '',
    role: 'EMPLEADO_SUCURSAL',
    branch: branches[0] ?? '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateField = (field: keyof NewDashboardUser, value: string) => {
    if (!value.trim()) return 'Este campo es obligatorio.'
    if (field === 'fullName' && value.trim().length < 3)
      return 'Ingresá al menos 3 caracteres.'
    if (field === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return 'Ingresá un email válido.'
      if (existingEmails.includes(value.trim().toLowerCase()))
        return 'Ya existe un usuario con este email.'
    }
    return undefined
  }

  const update = (field: keyof NewDashboardUser, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: validateField(field, value),
      }))
    }
  }

  const validate = () => {
    const nextErrors: FormErrors = {}
    ;(Object.keys(form) as (keyof NewDashboardUser)[]).forEach((field) => {
      const error = validateField(field, form[field])
      if (error) nextErrors[field] = error
    })
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const returnFocusElement = returnFocusRef.current
    document.body.style.overflow = 'hidden'
    const focusFrame = window.requestAnimationFrame(() => firstInputRef.current?.focus())

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeDialog()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      returnFocusElement?.focus()
    }
  }, [returnFocusRef])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) return
    onSubmit({
      ...form,
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
    })
  }

  const fieldError = (field: keyof NewDashboardUser) =>
    errors[field] ? `${field}-error` : undefined

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="max-h-[92svh] w-full overflow-y-auto rounded-t-3xl border border-outline-variant bg-surface-container-lowest shadow-2xl sm:max-w-2xl sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-outline-variant px-5 py-4 sm:px-6 sm:py-5 md:px-8">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-on-surface">Agregar usuario</h2>
              <p id={descriptionId} className="mt-1 text-sm text-on-surface-variant">
                Sumá un integrante y definí su acceso inicial.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 px-5 py-5 sm:px-6 md:grid-cols-2 md:gap-5 md:px-8 md:py-6">
            <label className="grid gap-1.5 text-sm font-bold text-on-surface md:col-span-2">
              Nombre completo
              <input
                ref={firstInputRef}
                value={form.fullName}
                onChange={(event) => update('fullName', event.target.value)}
                onBlur={(event) =>
                  setErrors((current) => ({ ...current, fullName: validateField('fullName', event.target.value) }))
                }
                aria-invalid={!!errors.fullName}
                aria-describedby={fieldError('fullName')}
                placeholder="Ej: Valentina García"
                className={inputClass}
              />
              {errors.fullName && <span id="fullName-error" className="text-xs font-medium text-error" role="alert">{errors.fullName}</span>}
            </label>

            <label className="grid gap-1.5 text-sm font-bold text-on-surface md:col-span-2">
              Email
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                onBlur={(event) =>
                  setErrors((current) => ({ ...current, email: validateField('email', event.target.value) }))
                }
                aria-invalid={!!errors.email}
                aria-describedby={fieldError('email')}
                placeholder="nombre@restaurante.com"
                className={inputClass}
              />
              {errors.email && <span id="email-error" className="text-xs font-medium text-error" role="alert">{errors.email}</span>}
            </label>

            <label className="grid gap-1.5 text-sm font-bold text-on-surface">
              Rol
              <select
                value={form.role}
                onChange={(event) => {
                  const nextRole = event.target.value as UserRole
                  update('role', nextRole)
                  if (nextRole === 'ADMIN_RESTAURANTE') update('branch', 'Todos los locales')
                  if (nextRole === 'EMPLEADO_SUCURSAL' && form.branch === 'Todos los locales') {
                    update('branch', branches[0] ?? '')
                  }
                }}
                className={inputClass}
              >
                <option value="EMPLEADO_SUCURSAL">Empleado</option>
                <option value="ADMIN_RESTAURANTE">Administrador</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-bold text-on-surface">
              Local
              <select
                value={form.branch}
                onChange={(event) => update('branch', event.target.value)}
                className={inputClass}
              >
                {form.role === 'ADMIN_RESTAURANTE' && <option value="Todos los locales">Todos los locales</option>}
                {branches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
              </select>
            </label>

            <p className="rounded-xl bg-primary/5 px-4 py-3 text-xs leading-5 text-on-primary-container md:col-span-2">
              Este prototipo agrega el usuario solo durante la sesión actual. El envío de invitaciones se conectará cuando exista el backend.
            </p>
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t border-outline-variant px-5 py-4 sm:flex-row sm:justify-end sm:px-6 md:px-8 md:py-5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-xl border border-outline-variant px-4 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-primary px-5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Agregar usuario
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
