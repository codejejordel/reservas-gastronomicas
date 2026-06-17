import { User, Mail, Phone, MessageSquare } from 'lucide-react'
import { useBooking } from '../../state/BookingContext'
import { InputWithIcon } from '@/shared/ui/InputWithIcon'
import { FieldLabel } from '@/shared/ui/FieldLabel'

export function CustomerDataForm() {
  const { cliente, setClienteField } = useBooking()

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Nombre completo *</FieldLabel>
        <InputWithIcon
          icon={User}
          type="text"
          placeholder="Juan Pérez"
          value={cliente.nombre}
          onChange={e => setClienteField('nombre', e.target.value)}
        />
      </div>

      <div>
        <FieldLabel>Email *</FieldLabel>
        <InputWithIcon
          icon={Mail}
          type="email"
          placeholder="juan@ejemplo.com"
          value={cliente.email}
          onChange={e => setClienteField('email', e.target.value)}
        />
      </div>

      <div>
        <FieldLabel>Teléfono *</FieldLabel>
        <InputWithIcon
          icon={Phone}
          type="tel"
          placeholder="+54 11 1234-5678"
          value={cliente.telefono}
          onChange={e => setClienteField('telefono', e.target.value)}
        />
      </div>

      <div>
        <FieldLabel>Observaciones (opcional)</FieldLabel>
        <div className="relative">
          <MessageSquare
            size={18}
            className="absolute left-3 top-3 text-on-surface-variant"
          />
          <textarea
            placeholder="Ej: Alergia al maní, mesa cerca de la ventana..."
            value={cliente.observaciones}
            onChange={e => setClienteField('observaciones', e.target.value)}
            rows={3}
            className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant bg-white text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-lg p-4">
        <p className="text-xs font-semibold text-on-surface mb-3">
          ¿Cómo querés recibir la confirmación?
        </p>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="canalNotif"
              checked={cliente.canalNotif === 'EMAIL'}
              onChange={() => setClienteField('canalNotif', 'EMAIL')}
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm text-on-surface">Por email</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="canalNotif"
              checked={cliente.canalNotif === 'WHATSAPP'}
              onChange={() => setClienteField('canalNotif', 'WHATSAPP')}
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm text-on-surface">Por WhatsApp</span>
          </label>
        </div>
      </div>
    </div>
  )
}
