import { useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas/registerSchema'
import { useRegister } from '@/features/auth/hooks/useRegister'
import { InputWithIcon } from '@/shared/ui/InputWithIcon'
import { PasswordStrength } from './PasswordStrength'
import { SuccessState } from './SuccessState'
import { BackToLoginButton } from './BackToLoginButton'
import { FadeUp } from '../animations/FadeUp'

interface RegisterFormProps {
  onGoToLogin: () => void
}

export function RegisterForm({ onGoToLogin }: RegisterFormProps) {
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { mutate, isPending, isSuccess } = useRegister()
  const navigate = useNavigate()
  const handleComplete = useCallback(() => navigate({ to: '/setup' }), [navigate])

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password', '')
  const onSubmit = (data: RegisterFormData) => mutate(data)

  if (isSuccess) {
    return <SuccessState title="¡Cuenta creada!" description="Configurá tu restaurante ahora." onComplete={handleComplete} completeDelay={1400} />
  }

  return (
    <div className="w-full max-w-[420px]">
      <FadeUp delay={0.0}>
        <BackToLoginButton onClick={onGoToLogin} />
      </FadeUp>

      <FadeUp delay={0.06}>
        <h2 className="font-serif text-3xl font-semibold text-on-surface mb-1">Creá tu cuenta</h2>
      </FadeUp>

      <FadeUp delay={0.18}>
        <p className="text-sm text-on-surface-variant mb-6">
          ¿Ya tenés cuenta?{' '}
          <button type="button" onClick={onGoToLogin} className="text-primary font-semibold hover:underline">
            Iniciá sesión
          </button>
        </p>
      </FadeUp>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Name */}
        <FadeUp delay={0.24} className="mb-3">
          <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1 tracking-wide">
            Nombre completo
          </label>
          <InputWithIcon
            icon={User}
            type="text"
            placeholder="Ana García"
            autoComplete="name"
            error={!!errors.name}
            {...register('name')}
          />
          <AnimatePresence>
            {errors.name && (
              <motion.p className="text-xs text-error mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {errors.name.message}
              </motion.p>
            )}
          </AnimatePresence>
        </FadeUp>

        {/* Email */}
        <FadeUp delay={0.30} className="mb-3">
          <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1 tracking-wide">
            Correo electrónico
          </label>
          <InputWithIcon
            icon={Mail}
            type="email"
            placeholder="ana@restaurante.com"
            autoComplete="email"
            error={!!errors.email}
            {...register('email')}
          />
          <AnimatePresence>
            {errors.email && (
              <motion.p className="text-xs text-error mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </FadeUp>

        {/* Phone */}
        <FadeUp delay={0.36} className="mb-3">
          <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1 tracking-wide">
            Teléfono
          </label>
          <InputWithIcon
            icon={Phone}
            type="tel"
            placeholder="+54 11 1234-5678"
            autoComplete="tel"
            error={!!errors.phone}
            {...register('phone')}
          />
          <AnimatePresence>
            {errors.phone && (
              <motion.p className="text-xs text-error mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {errors.phone.message}
              </motion.p>
            )}
          </AnimatePresence>
        </FadeUp>

        {/* Password */}
        <FadeUp delay={0.42} className="mb-1">
          <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1 tracking-wide">
            Contraseña
          </label>
          <InputWithIcon
            icon={Lock}
            type={showPass ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            error={!!errors.password}
            rightSlot={
              <button type="button" onClick={() => setShowPass((p) => !p)} className="text-outline hover:text-primary transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register('password')}
          />
          <PasswordStrength password={password} />
          <AnimatePresence>
            {errors.password && (
              <motion.p className="text-xs text-error mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </FadeUp>

        {/* Confirm password */}
        <FadeUp delay={0.48} className="mb-6">
          <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1 tracking-wide">
            Repetir contraseña
          </label>
          <InputWithIcon
            icon={Lock}
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repetí tu contraseña"
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            rightSlot={
              <button type="button" onClick={() => setShowConfirm((p) => !p)} className="text-outline hover:text-primary transition-colors">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register('confirmPassword')}
          />
          <AnimatePresence>
            {errors.confirmPassword && (
              <motion.p className="text-xs text-error mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </AnimatePresence>
        </FadeUp>

        {/* Terms */}
        <FadeUp delay={0.54} className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 rounded accent-primary shrink-0"
              {...register('terms')}
            />
            <span className="text-sm text-on-surface-variant">
              Acepto los{' '}
              <a href="#" className="text-primary font-semibold hover:underline">Términos de servicio</a>
              {' '}y la{' '}
              <a href="#" className="text-primary font-semibold hover:underline">Política de privacidad</a>
            </span>
          </label>
          <AnimatePresence>
            {errors.terms && (
              <motion.p className="text-xs text-error mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {errors.terms.message}
              </motion.p>
            )}
          </AnimatePresence>
        </FadeUp>

        <FadeUp delay={0.60}>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center justify-center gap-2 mb-6 hover:opacity-90 hover:-translate-y-px hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            Continuar
          </button>
        </FadeUp>
      </form>

      <FadeUp delay={0.66}>
        <p className="text-sm text-on-surface-variant text-center">
          ¿Ya tenés cuenta?{' '}
          <button type="button" onClick={onGoToLogin} className="text-primary font-semibold hover:underline">
            Iniciá sesión
          </button>
        </p>
      </FadeUp>
    </div>
  )
}
