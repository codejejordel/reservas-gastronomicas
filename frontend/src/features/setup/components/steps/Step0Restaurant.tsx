import { motion } from 'motion/react'
import { Building2, FileText, Hash, ChefHat, MapPin, Quote, Mail, Link, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { useSetupWizard } from '@/features/setup/state/SetupWizardContext'
import { InputWithIcon } from '@/shared/ui/InputWithIcon'
import { FieldLabel } from '@/shared/ui/FieldLabel'
import { FadeUp } from '@/features/auth/components/animations/FadeUp'
import { useSubmitStep0 } from '@/features/setup/hooks/useSubmitStep0'
import { useValidateSlug, useValidateNombre } from '@/features/setup/hooks/useValidateRestaurantUnique'

export function Step0Restaurant() {
  const { restaurant, setRestaurantField, ids } = useSetupWizard()
  const { submit, isPending, error } = useSubmitStep0()

  const slugCheck = useValidateSlug(restaurant.slug, ids.restauranteId ?? undefined)
  const nombreCheck = useValidateNombre(restaurant.nombrePublico, ids.restauranteId ?? undefined)

  const slugTaken = slugCheck.data?.disponible === false
  const nombreTaken = nombreCheck.data?.disponible === false

  const canContinue =
    restaurant.nombrePublico.trim().length > 0 &&
    !slugTaken &&
    !nombreTaken &&
    !isPending

  return (
    <FadeUp delay={0.1}>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.4rem' }}>
        Contanos sobre tu restaurante
      </h2>
      <p className="text-sm text-on-surface-variant mb-6">
        Estos datos identifican tu negocio. Lo que no completes ahora lo podés agregar después.
      </p>

      <div className="flex flex-col gap-3">
        {/* Nombre público — obligatorio */}
        <div>
          <FieldLabel>Nombre público *</FieldLabel>
          <InputWithIcon
            icon={Building2}
            type="text"
            placeholder="Ej: La Parrilla de Roberto"
            value={restaurant.nombrePublico}
            onChange={e => setRestaurantField('nombrePublico', e.target.value)}
          />
        </div>

        {/* Slug — autogenerado, editable */}
        <div>
          <div className="flex items-center justify-between">
            <FieldLabel>URL pública</FieldLabel>
            {slugCheck.isFetching && (
              <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                <Loader2 size={11} className="animate-spin" /> Verificando...
              </span>
            )}
            {!slugCheck.isFetching && slugTaken && (
              <span className="flex items-center gap-1 text-xs text-error font-medium">
                <XCircle size={12} /> No disponible
              </span>
            )}
            {!slugCheck.isFetching && slugCheck.isSuccess && !slugTaken && restaurant.slug.length >= 3 && (
              <span className="flex items-center gap-1 text-xs text-success font-medium">
                <CheckCircle2 size={12} /> Disponible
              </span>
            )}
          </div>
          <div className="flex items-center gap-0">
            <span className="text-xs text-on-surface-variant bg-surface-container px-3 py-[0.65rem] rounded-l-lg border border-r-0 border-outline-variant whitespace-nowrap">
              tuapp.com/r/
            </span>
            <InputWithIcon
              icon={Link}
              type="text"
              placeholder="la-parrilla-de-roberto"
              value={restaurant.slug}
              onChange={e => setRestaurantField('slug', e.target.value)}
              className="rounded-l-none"
            />
          </div>
        </div>

        {/* Razón social */}
        <div>
          <FieldLabel>Razón social</FieldLabel>
          <InputWithIcon
            icon={FileText}
            type="text"
            placeholder="Roberto S.R.L."
            value={restaurant.razonSocial}
            onChange={e => setRestaurantField('razonSocial', e.target.value)}
          />
        </div>

        {/* CUIT */}
        <div>
          <FieldLabel>CUIT</FieldLabel>
          <InputWithIcon
            icon={Hash}
            type="text"
            placeholder="30-12345678-9"
            value={restaurant.cuit}
            onChange={e => setRestaurantField('cuit', e.target.value)}
          />
        </div>

        {/* Tipo de cocina + Ciudad */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Tipo de cocina</FieldLabel>
            <InputWithIcon
              icon={ChefHat}
              type="text"
              placeholder="Parrilla, Italiana..."
              value={restaurant.tipoCocina}
              onChange={e => setRestaurantField('tipoCocina', e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Ciudad</FieldLabel>
            <InputWithIcon
              icon={MapPin}
              type="text"
              placeholder="Buenos Aires"
              value={restaurant.ciudadPrincipal}
              onChange={e => setRestaurantField('ciudadPrincipal', e.target.value)}
            />
          </div>
        </div>

        {/* Slogan */}
        <div>
          <FieldLabel>Slogan</FieldLabel>
          <InputWithIcon
            icon={Quote}
            type="text"
            placeholder="La mejor carne al fuego lento"
            value={restaurant.slogan}
            onChange={e => setRestaurantField('slogan', e.target.value)}
          />
        </div>

        {/* Email comercial */}
        <div>
          <FieldLabel>Email comercial</FieldLabel>
          <InputWithIcon
            icon={Mail}
            type="email"
            placeholder="contacto@laparrilla.com"
            value={restaurant.emailComercial}
            onChange={e => setRestaurantField('emailComercial', e.target.value)}
          />
        </div>
      </div>

      {/* Validation feedback */}
      {nombreTaken && (
        <div className="flex items-center gap-2 text-xs text-error font-medium px-1">
          <XCircle size={13} /> El nombre ya está registrado
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-error-container rounded-xl text-xs text-error font-medium">
          {error.message}
        </div>
      )}

      {/* Continue */}
      <motion.button
        type="button"
        onClick={submit}
        disabled={!canContinue}
        whileHover={canContinue ? { opacity: 0.9, y: -1 } : {}}
        whileTap={canContinue ? { scale: 0.98 } : {}}
        className="w-full py-3 mt-6 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-px hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <><Loader2 size={15} className="animate-spin" /> Guardando...</>
        ) : (
          'Continuar →'
        )}
      </motion.button>
    </FadeUp>
  )
}
