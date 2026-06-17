import { useEffect } from 'react'
import { useBooking } from '../../state/BookingContext'
import { useSucursalesPublicas } from '../../hooks/useSucursalesPublicas'
import { ButtonStepers } from '../shared/ButtonStepers'
import { MapPin, Phone, Check } from 'lucide-react'

export function Step0SucursalPage() {
  const { restaurante, sucursal, setSucursal, nextStep } = useBooking()

  const { data: sucursales, isLoading } = useSucursalesPublicas(restaurante?.id)

  // Auto-skip si solo hay 1 sucursal
  useEffect(() => {
    if (sucursales && sucursales.length === 1 && !sucursal) {
      setSucursal(sucursales[0])
      nextStep()
    }
  }, [sucursales, sucursal, setSucursal, nextStep])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!sucursales || sucursales.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-on-surface mb-2">No hay sucursales disponibles</p>
        <p className="text-sm text-on-surface-variant">Este restaurante no tiene sucursales activas</p>
      </div>
    )
  }

  const handleSelectSucursal = (s: typeof sucursales[0]) => {
    setSucursal(s)
    nextStep()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-on-surface mb-2">Seleccioná una sucursal</h2>
        <p className="text-sm text-on-surface-variant">
          {restaurante?.nombrePublico} tiene {sucursales.length} sucursal{sucursales.length > 1 ? 'es' : ''}
        </p>
      </div>

      <div className="grid gap-4">
        {sucursales.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelectSucursal(s)}
            className={`
              relative flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left
              ${sucursal?.id === s.id
                ? 'border-primary bg-primary/5'
                : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container'
              }
            `}
          >
            {sucursal?.id === s.id && (
              <div className="absolute top-3 right-3 text-primary">
                <Check size={20} />
              </div>
            )}

            <h3 className="font-medium text-on-surface text-lg pr-8">{s.nombre}</h3>

            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <MapPin size={14} />
                <span>{s.direccion}{s.ciudad ? `, ${s.ciudad}` : ''}</span>
              </div>

              {s.telefono && (
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Phone size={14} />
                  <span>{s.telefono}</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {sucursal && (
        <div className="flex justify-end pt-4">
          <ButtonStepers
            onNext={nextStep}
            showBack={false}
            nextLabel="Continuar →"
          />
        </div>
      )}
    </div>
  )
}
