export const themeKey = 'inkwell-theme'

function readStoredTheme(): string | null {
  try {
    return window.localStorage.getItem(themeKey)
  } catch {
    return null
  }
}

export function initializeTheme() {
  if (typeof document === 'undefined') return
  const savedTheme = readStoredTheme()
  const isLight = savedTheme === 'light'
  document.documentElement.dataset.theme = isLight ? 'light' : 'dark'
  document.documentElement.style.colorScheme = isLight ? 'light' : 'dark'
}

export function getStoredTheme(): 'light' | 'dark' {
  return readStoredTheme() === 'light' ? 'light' : 'dark'
}
