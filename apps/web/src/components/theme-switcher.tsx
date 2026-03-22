import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      title={isDark ? 'Mudar para claro' : 'Mudar para escuro'}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
