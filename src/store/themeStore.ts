import { create } from 'zustand'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'skillbridge-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

/**
 * Preferência de tema (claro/escuro) persistida em localStorage.
 * O <html> já recebe a classe correta antes do primeiro paint via script inline no index.html;
 * aqui só sincronizamos o estado do app e reaplicamos ao alternar.
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    applyTheme(theme)
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage indisponível (modo privado, etc.) — tema só não persiste entre sessões
    }
    set({ theme })
  },
  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}))
