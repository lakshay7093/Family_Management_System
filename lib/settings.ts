export type ThemeSetting = "system" | "light" | "dark"

export interface Settings {
  theme: ThemeSetting
  notificationsEnabled: boolean
  defaultStartPage: string
}

const STORAGE_KEY = "familyHub.settings"

export const defaultSettings: Settings = {
  theme: "system",
  notificationsEnabled: true,
  defaultStartPage: "/dashboard",
}

export function getSavedSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>
      return { ...defaultSettings, ...parsed }
    }
  } catch {
    // ignore parse errors
  }
  return defaultSettings
}

export function saveSettings(settings: Settings) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // ignore storage errors
  }
}

export function applyTheme(theme: ThemeSetting) {
  const root = document.documentElement

  const isSystemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
  const isDark = theme === "dark" || (theme === "system" && isSystemDark)

  if (isDark) {
    // Keep the background image visible while making the overall page feel darker.
    root.style.setProperty("--background", "rgba(15, 17, 26, 0.78)")
    root.style.setProperty("--foreground", "#f3f4f6")
  } else {
    root.style.setProperty("--background", "rgba(255, 255, 255, 0.78)")
    root.style.setProperty("--foreground", "#0f172a")
  }
}
