"use client"

import { useEffect, useState } from "react"
import { applyTheme, getSavedSettings, saveSettings, Settings } from "@/lib/settings"
import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"

const themeOptions = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
]

const defaultPages = [
  { label: "Dashboard", value: "/dashboard" },
  { label: "Members", value: "/dashboard/members" },
  { label: "Tasks", value: "/dashboard/tasks" },
  { label: "Expenses", value: "/dashboard/expenses" },
  { label: "Events", value: "/dashboard/events" },
  { label: "Documents", value: "/dashboard/documents" },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => getSavedSettings())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme])

  const update = (newSettings: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...newSettings }))
    setSaved(false)
  }

  const handleSave = () => {
    saveSettings(settings)
    applyTheme(settings.theme)
    setSaved(true)
    toast.success("Settings saved")
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="mt-2 text-sm text-slate-600">
            Customize how Family Hub behaves for you. Settings are saved locally in your browser.
          </p>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Theme" subtitle="Choose light, dark, or follow your system preference.">
          <div className="mt-3 space-y-3">
            {themeOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={settings.theme === option.value}
                  onChange={() => update({ theme: option.value as Settings["theme"] })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-700">{option.label}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card
          title="Preferences"
          subtitle="Adjust a few default behaviors to make the dashboard feel like yours."
        >
          <div className="mt-3 space-y-4">
            <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">Enable notifications</span>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => update({ notificationsEnabled: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Default start page</span>
              <select
                value={settings.defaultStartPage}
                onChange={(e) => update({ defaultStartPage: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {defaultPages.map((page) => (
                  <option key={page.value} value={page.value}>
                    {page.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Card>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Tip: Your settings are stored locally in this browser. Switching devices will use default settings unless you set them again.
        </p>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              Saved!
            </span>
          )}
          <Button type="button" onClick={handleSave} size="lg" className="px-6 py-3">
            Save settings
          </Button>
        </div>
      </div>
    </div>
  )
}
