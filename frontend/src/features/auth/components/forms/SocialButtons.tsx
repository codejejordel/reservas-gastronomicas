import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useGoogleLogin } from '@/features/auth/hooks/useGoogleLogin'
import { Alert } from '@/shared/ui/Alert'

const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client'

export function SocialButtons() {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [scriptState, setScriptState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [setupError, setSetupError] = useState<string | null>(null)
  const { mutate, isPending, isError, error } = useGoogleLogin()

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const buttonElement = buttonRef.current
    if (!clientId) {
      setSetupError('El acceso con Google no está configurado.')
      setScriptState('error')
      return
    }

    let active = true
    let script = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_SCRIPT_URL}"]`)

    const initializeGoogle = () => {
      if (!active) return
      if (!window.google || !buttonElement) {
        setSetupError('No se pudo cargar el acceso con Google.')
        setScriptState('error')
        return
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (!active) return
          if (!response.credential) {
            setSetupError('Google no devolvió una credencial válida.')
            return
          }
          setSetupError(null)
          mutate(response.credential)
        },
      })
      buttonElement.replaceChildren()
      window.google.accounts.id.renderButton(buttonElement, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: 360,
      })
      setScriptState('ready')
    }

    const handleScriptError = () => {
      if (!active) return
      setSetupError('No se pudo cargar el acceso con Google.')
      setScriptState('error')
    }

    if (window.google) {
      initializeGoogle()
    } else if (script) {
      script.addEventListener('load', initializeGoogle)
      script.addEventListener('error', handleScriptError)
    } else {
      script = document.createElement('script')
      script.src = GOOGLE_SCRIPT_URL
      script.async = true
      script.defer = true
      script.addEventListener('load', initializeGoogle)
      script.addEventListener('error', handleScriptError)
      document.head.appendChild(script)
    }

    return () => {
      active = false
      script?.removeEventListener('load', initializeGoogle)
      script?.removeEventListener('error', handleScriptError)
      buttonElement?.replaceChildren()
      window.google?.accounts.id.cancel()
    }
  }, [mutate])

  return (
    <div className="mb-6 space-y-3">
      <div className="flex min-h-10 items-center justify-center" aria-busy={scriptState === 'loading' || isPending}>
        {(scriptState === 'loading' || isPending) && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        <div ref={buttonRef} className={scriptState !== 'ready' || isPending ? 'hidden' : ''} />
      </div>
      {(setupError || isError) && (
        <Alert variant="error">
          {setupError ?? (error instanceof Error ? error.message : 'No se pudo iniciar sesión con Google')}
        </Alert>
      )}
    </div>
  )
}
