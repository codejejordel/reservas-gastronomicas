import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Check, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { Alert } from '@/shared/ui/Alert'
import { HeroPanel } from './components/hero/HeroPanel'
import { PasswordStrength } from './components/forms/PasswordStrength'
import { confirmPasswordReset, requestPasswordReset, verifyPasswordReset } from './services/authService'

type Step = 1 | 2 | 3 | 4

const STEP_COPY = {
  1: { eyebrow: 'Recuperar acceso', title: '¿Olvidaste tu contraseña?', description: 'Ingresá el correo de tu cuenta y te ayudamos a volver a Turnify.', action: 'Enviar código' },
  2: { eyebrow: 'Verificación', title: 'Confirmá tu identidad', description: 'Ingresá el código de 6 dígitos que recibiste.', action: 'Verificar código' },
  3: { eyebrow: 'Nueva contraseña', title: 'Creá una contraseña segura', description: 'Elegí una clave nueva para proteger tu cuenta.', action: 'Actualizar contraseña' },
} as const

function RecoveryHero() {
  return (
    <div className="relative z-10 flex h-full max-w-[430px] flex-col justify-center">
      <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Acceso protegido
      </span>
      <h1 className="font-serif text-[clamp(2.4rem,4vw,4.25rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-white">
        Volvé a poner tu sala <span className="text-primary-fixed">en marcha.</span>
      </h1>
      <p className="mt-6 max-w-[360px] text-base leading-7 text-white/70">
        Recuperá el acceso a tus reservas, mesas y clientes en unos pocos pasos seguros.
      </p>
      <div className="mt-10 grid grid-cols-3 gap-3 border-t border-white/15 pt-7">
        {['Solicitá', 'Verificá', 'Actualizá'].map((label, index) => (
          <div key={label} className="min-w-0">
            <span className="text-xs font-bold text-primary-fixed">0{index + 1}</span>
            <p className="mt-1 text-xs font-semibold text-white/75">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const activeCopy = step === 4 ? null : STEP_COPY[step]

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    try {
      if (step === 1) {
        const response = await requestPasswordReset(email)
        setChallengeId(response.challengeId)
        setStep(2)
      } else if (step === 2) {
        const response = await verifyPasswordReset(challengeId, code)
        setResetToken(response.resetToken)
        setStep(3)
      } else if (step === 3) {
        if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.')
        if (password !== confirmPassword) throw new Error('Las contraseñas no coinciden.')
        await confirmPasswordReset(resetToken, password)
        setStep(4)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos procesar la solicitud. Intentá nuevamente.')
    } finally {
      setPending(false)
    }
  }

  function editEmail() {
    setCode('')
    setError(null)
    setStep(1)
  }

  return (
    <div className="min-h-[100svh] bg-surface lg:flex">
      <aside className="hidden lg:block" style={{ width: '48vw', minHeight: '100svh' }}>
        <HeroPanel style={{ width: '100%', height: '100%' }}>
          <RecoveryHero />
        </HeroPanel>
      </aside>

      <main className="flex min-h-[100svh] flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <motion.section
          className="w-full"
          style={{ maxWidth: 440 }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a iniciar sesión
          </Link>

          {step < 4 && (
            <div className="mt-9" aria-label={`Paso ${step} de 3`}>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex flex-1 items-center gap-2 last:flex-none">
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${item < step ? 'bg-primary text-on-primary' : item === step ? 'bg-primary text-on-primary shadow-[0_0_0_4px_rgba(0,105,107,0.12)]' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      {item < step ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : item}
                    </span>
                    {item < 3 && <span className={`h-px flex-1 ${item < step ? 'bg-primary' : 'bg-outline-variant'}`} />}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Paso {step} de 3</p>
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {step === 4 ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="py-14 text-center">
                <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-on-primary shadow-lg">
                  <Check className="h-8 w-8" aria-hidden="true" />
                </motion.div>
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-primary">Todo listo</p>
                <h1 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.03em] text-on-surface">Contraseña actualizada</h1>
                <p className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-on-surface-variant">Tu cuenta ya está protegida con la nueva contraseña. Iniciá sesión para continuar.</p>
                <Link to="/login" className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3.5 text-sm font-bold text-on-primary shadow-sm transition-[transform,box-shadow,opacity] hover:-translate-y-px hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">Iniciar sesión</Link>
              </motion.div>
            ) : activeCopy && (
              <motion.form key={step} onSubmit={submit} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }} className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{activeCopy.eyebrow}</p>
                <h1 className="mt-2 text-balance font-serif text-3xl font-semibold tracking-[-0.035em] text-on-surface sm:text-[2.15rem]">{activeCopy.title}</h1>
                <p className="mt-3 max-w-[390px] text-sm leading-6 text-on-surface-variant">{activeCopy.description}</p>

                <div className="mt-8 space-y-5">
                  {step === 1 && <label className="block text-sm font-bold text-on-surface">Correo electrónico<div className="relative mt-2"><Mail className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-outline" aria-hidden="true" /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" spellCheck={false} placeholder="nombre@restaurante.com" required className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-3 text-sm text-on-surface placeholder:text-outline-variant transition-[border-color,box-shadow] focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(7,169,169,0.14)]" /></div></label>}
                  {step === 2 && <><label className="block text-sm font-bold text-on-surface">Código de verificación<div className="relative mt-2"><KeyRound className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-outline" aria-hidden="true" /><input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" spellCheck={false} pattern="[0-9]{6}" placeholder="000000" required className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-3 text-center font-mono text-xl font-bold tracking-[0.42em] text-on-surface placeholder:tracking-[0.42em] placeholder:text-outline-variant transition-[border-color,box-shadow] focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(7,169,169,0.14)]" /></div></label><p className="text-sm leading-6 text-on-surface-variant">Enviado a <span className="font-semibold text-on-surface">{email}</span>. ¿No es tu correo? <button type="button" onClick={editEmail} className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Cambiarlo</button></p></>}
                  {step === 3 && <><label className="block text-sm font-bold text-on-surface">Nueva contraseña<div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-outline" aria-hidden="true" /><input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Mínimo 8 caracteres" required className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-11 text-sm text-on-surface placeholder:text-outline-variant transition-[border-color,box-shadow] focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(7,169,169,0.14)]" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}</button></div></label><PasswordStrength password={password} /><label className="block text-sm font-bold text-on-surface">Repetir contraseña<div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-outline" aria-hidden="true" /><input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" placeholder="Repetí tu contraseña" required className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-11 text-sm text-on-surface placeholder:text-outline-variant transition-[border-color,box-shadow] focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(7,169,169,0.14)]" /><button type="button" onClick={() => setShowConfirmation((value) => !value)} aria-label={showConfirmation ? 'Ocultar confirmación' : 'Mostrar confirmación'} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{showConfirmation ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}</button></div></label></>}

                  <AnimatePresence>{error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} aria-live="polite"><Alert variant="error">{error}</Alert></motion.div>}</AnimatePresence>
                  <button type="submit" disabled={pending || (step === 2 && code.length !== 6)} className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3.5 text-sm font-bold text-on-primary shadow-sm transition-[transform,box-shadow,opacity] hover:-translate-y-px hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Procesando…' : activeCopy.action}</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.section>
      </main>
    </div>
  )
}
