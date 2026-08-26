import { User, Mail, Phone, MessageCircle, MessageSquare } from 'lucide-react'
import { useBooking } from '../../state/BookingContext'
import { InputWithIcon } from '@/shared/ui/InputWithIcon'
import { FieldLabel } from '@/shared/ui/FieldLabel'

export function CustomerDataForm() {
  const { cliente, setClienteField } = useBooking()

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel htmlFor="booking-name" className="text-sm normal-case tracking-normal lg:text-[11px] lg:uppercase lg:tracking-wide">Nombre completo *</FieldLabel>
        <InputWithIcon
          id="booking-name"
          icon={User}
          type="text"
          placeholder="Juan Pérez"
          value={cliente.nombre}
          onChange={e => setClienteField('nombre', e.target.value)}
          className="min-h-12 lg:min-h-0"
          autoComplete="name"
        />
      </div>

      <div>
        <FieldLabel htmlFor="booking-email" className="text-sm normal-case tracking-normal lg:text-[11px] lg:uppercase lg:tracking-wide">Email *</FieldLabel>
        <InputWithIcon
          id="booking-email"
          icon={Mail}
          type="email"
          placeholder="juan@ejemplo.com"
          value={cliente.email}
          onChange={e => setClienteField('email', e.target.value)}
          className="min-h-12 lg:min-h-0"
          autoComplete="email"
        />
      </div>

      <div>
        <FieldLabel htmlFor="booking-phone" className="text-sm normal-case tracking-normal lg:text-[11px] lg:uppercase lg:tracking-wide">Teléfono *</FieldLabel>
        <InputWithIcon
          id="booking-phone"
          icon={Phone}
          type="tel"
          placeholder="+54 11 1234-5678"
          value={cliente.telefono}
          onChange={e => setClienteField('telefono', e.target.value)}
          className="min-h-12 lg:min-h-0"
          autoComplete="tel"
        />
      </div>

      <div>
        <FieldLabel htmlFor="booking-notes" className="text-sm normal-case tracking-normal lg:text-[11px] lg:uppercase lg:tracking-wide">Observaciones (opcional)</FieldLabel>
        <div className="relative">
          <MessageSquare
            size={18}
            className="absolute left-3 top-3 text-on-surface-variant"
          />
          <textarea
            id="booking-notes"
            placeholder="Ej: Alergia al maní, mesa cerca de la ventana..."
            value={cliente.observaciones}
            onChange={e => setClienteField('observaciones', e.target.value)}
            rows={3}
            className="min-h-24 w-full pl-10 pr-3 py-3 rounded-lg border border-outline-variant bg-white text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none lg:min-h-0 lg:py-2.5"
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-lg p-4">
        <p className="text-sm font-semibold text-on-surface mb-3 lg:text-xs">
          ¿Cómo querés recibir la confirmación?
        </p>
        <div className="flex flex-col gap-2">
          <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 transition-colors focus-within:ring-2 focus-within:ring-primary lg:min-h-0 lg:gap-2 lg:rounded-none lg:border-0 lg:px-0 ${cliente.canalNotif === 'EMAIL' ? 'border-primary bg-primary/5 lg:bg-transparent' : 'border-outline-variant bg-white lg:bg-transparent'}`}>
            <input
              type="radio"
              name="canalNotif"
              checked={cliente.canalNotif === 'EMAIL'}
              onChange={() => setClienteField('canalNotif', 'EMAIL')}
              className="w-5 h-5 text-primary lg:w-4 lg:h-4"
            />
            <Mail size={18} className="text-primary lg:hidden" aria-hidden="true" />
            <span className="text-sm text-on-surface">Por email</span>
          </label>
          <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 transition-colors focus-within:ring-2 focus-within:ring-primary lg:min-h-0 lg:gap-2 lg:rounded-none lg:border-0 lg:px-0 ${cliente.canalNotif === 'WHATSAPP' ? 'border-primary bg-primary/5 lg:bg-transparent' : 'border-outline-variant bg-white lg:bg-transparent'}`}>
            <input
              type="radio"
              name="canalNotif"
              checked={cliente.canalNotif === 'WHATSAPP'}
              onChange={() => setClienteField('canalNotif', 'WHATSAPP')}
              className="w-5 h-5 text-primary lg:w-4 lg:h-4"
            />
            <MessageCircle size={18} className="text-primary lg:hidden" aria-hidden="true" />
            <span className="text-sm text-on-surface">Por WhatsApp</span>
          </label>
        </div>
      </div>
    </div>
  )
}
