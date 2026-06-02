import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { COLOR_PRESETS } from '../utils/providers'

export function useTheme() {
  const { themePreset, customPrimary, customSecondary, applyStoredTheme, setTheme } = useAppStore()

  // Apply stored theme on mount
  useEffect(() => {
    applyStoredTheme()
  }, [])

  const applyTheme = (presetName, primary = null, secondary = null) => {
    const preset = COLOR_PRESETS[presetName]
    if (preset) {
      document.documentElement.style.setProperty('--color-bg', preset.bg || '#0a0a0f')
      document.documentElement.style.setProperty('--color-secondary', preset.secondary)
      document.documentElement.style.backgroundColor = preset.bg || '#0a0a0f'
    }
    setTheme(presetName, primary, secondary)
  }

  return { themePreset, customPrimary, customSecondary, setTheme: applyTheme }
}

export function usePrimaryColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
}
