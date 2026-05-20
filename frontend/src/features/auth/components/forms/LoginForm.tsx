import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/loginSchema'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { InputWithIcon } from '@/shared/ui/InputWithIcon'
import { SocialButtons } from './SocialButtons'
import { FormDivider } from './FormDivider'
import { SuccessState } from './SuccessState'
import { FadeUp } from '../animations/FadeUp'

interface LoginFormProps {
  onGoToRegister: () => void
}

export function LoginForm({ onGoToRegister }: LoginFormProps) {
  const [showPass, setShowPass] = useState(false)
  const { mutate, isPending, isSuccess } = useLogin()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => mutate(data)

  if (isSuccess) {
    return <SuccessState title="¡Bienvenido de vuelta!" description="Redirigiendo a tu panel..." />
  }

  return (
    <div className="w-full max-w-[400px]">
      <FadeUp delay={0.0}>
        <h2 className="font-serif text-3xl font-semibold text-on-surface mb-1">Iniciá sesión</h2>
      </FadeUp>

      <FadeUp delay={0.18}>
        <p className="text-sm text-on-surface-variant mb-6">
          ¿No tenés cuenta?{' '}
          <button type="button" onClick={onGoToRegister} className="text-primary font-semibold hover:underline">
            Registrate gratis
          </button>
        </p>
      </FadeUp>

      <FadeUp delay={0.24}><SocialButtons /></FadeUp>
      <FadeUp delay={0.30}><FormDivider /></FadeUp>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FadeUp delay={0.36} className="mb-3">
          <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1 tracking-wide">
            Correo electrónico
          </label>
          <InputWithIcon
            icon={Mail}
            type="email"
            placeholder="nombre@restaurante.com"
            autoComplete="email"
            error={!!errors.email}
            {...register('email')}
          />
          <AnimatePresence>
            {errors.email && (
              <motion.p
                className="text-xs text-error mt-1"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </FadeUp>

        <FadeUp delay={0.42} className="mb-3">
          <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1 tracking-wide">
            Contraseña
          </label>
          <InputWithIcon
            icon={Lock}
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            error={!!errors.password}
            rightSlot={
              <button type="button" onClick={() => setShowPass((p) => !p)} className="text-outline hover:text-primary transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register('password')}
          />
          <AnimatePresence>
            {errors.password && (
              <motion.p
                className="text-xs text-error mt-1"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </FadeUp>

        <FadeUp delay={0.48} className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded accent-primary cursor-pointer"
              {...register('remember')}
            />
            <span className="text-sm text-on-surface-variant">Recordarme</span>
          </label>
          <button type="button" className="text-sm text-primary font-semibold hover:opacity-75 transition-opacity">
            ¿Olvidaste tu contraseña?
          </button>
        </FadeUp>

        <FadeUp delay={0.54}>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center justify-center gap-2 mb-6 hover:opacity-90 hover:-translate-y-px hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Ingresar a Turnify
          </button>
        </FadeUp>
      </form>

      <FadeUp delay={0.60}>
        <p className="text-sm text-on-surface-variant text-center">
          ¿Nuevo en Turnify?{' '}
          <button type="button" onClick={onGoToRegister} className="text-primary font-semibold hover:underline">
            Crear cuenta gratis
          </button>
        </p>
      </FadeUp>
    </div>
  )
}
