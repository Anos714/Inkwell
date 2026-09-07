export const themeKey = 'inkwell-theme'

export function initializeTheme() {
  const savedTheme = window.localStorage.getItem(themeKey)
  const isLight = savedTheme === 'light'
  document.documentElement.dataset.theme = isLight ? 'light' : 'dark'
  document.documentElement.style.colorScheme = isLight ? 'light' : 'dark'
}
