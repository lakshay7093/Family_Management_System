"use client"

import { useEffect } from "react"
import { applyTheme, getSavedSettings } from "@/lib/settings"

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = getSavedSettings()
    applyTheme(saved.theme)

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => applyTheme(saved.theme)
    mediaQuery.addEventListener("change", handler)

    return () => {
      mediaQuery.removeEventListener("change", handler)
    }
  }, [])

  return <>{children}</>
}
