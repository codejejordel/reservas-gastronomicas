import { useEffect, useState, type ReactNode } from 'react'
import { useThemeStore } from './themeStore'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useThemeStore((s) => s.theme)
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const next = theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme
      setResolved(next)
    }

    apply()

    if (theme === 'system') {
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [theme])

  return <div className={resolved === 'dark' ? 'dark' : ''}>{children}</div>
}
