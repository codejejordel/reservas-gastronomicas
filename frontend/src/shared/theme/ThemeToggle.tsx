import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from './themeStore'

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Cambiar a claro' : 'Cambiar a oscuro'}
      className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
