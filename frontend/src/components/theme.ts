export const themeKey = 'inkwell-theme'

export type Theme = 'light' | 'dark'

const THEME_COLOR: Record<Theme, string> = {
  light: '#f2ecdd',
  dark: '#0d110d',
}

function readStoredTheme(): string | null {
  try {
    return window.localStorage.getItem(themeKey)
  } catch {
    return null
  }
}

/** Apply a theme to the document and keep the browser chrome in step. */
export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR[theme])
}

/**
 * The reading room is paper-first: a first visit opens on parchment. Anyone
 * who has chosen the night reading room keeps it.
 */
export function initializeTheme() {
  applyTheme(getStoredTheme())
}

export function getStoredTheme(): Theme {
  return readStoredTheme() === 'dark' ? 'dark' : 'light'
}
