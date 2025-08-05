import { useTheme } from './theme-provider'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️'
      case 'dark':
        return '🌙'
      default:
        return '💻'
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Claro'
      case 'dark':
        return 'Escuro'
      default:
        return 'Sistema'
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
      title={`Tema: ${getLabel()}`}
    >
      <span className="text-lg">{getIcon()}</span>
      <span className="text-sm font-medium">{getLabel()}</span>
    </button>
  )
}
