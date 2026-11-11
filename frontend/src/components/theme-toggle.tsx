import { useState } from 'react'
import { FaMoon, FaSun } from 'react-icons/fa'
import { applyTheme, themeKey } from './theme'

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(() => document.documentElement.dataset.theme === 'light')

  const toggleTheme = () => {
    const nextIsLight = !isLight
    setIsLight(nextIsLight)
    applyTheme(nextIsLight ? 'light' : 'dark')
    window.localStorage.setItem(themeKey, nextIsLight ? 'light' : 'dark')
  }

  return (
    <button type="button" aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'} onClick={toggleTheme} className="theme-toggle" title={isLight ? 'Dark mode' : 'Light mode'}>
      {isLight ? <FaMoon aria-hidden="true" /> : <FaSun aria-hidden="true" />}
    </button>
  )
}
