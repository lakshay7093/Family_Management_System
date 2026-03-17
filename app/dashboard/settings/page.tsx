"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { applyTheme, getSavedSettings, saveSettings, Settings, defaultSettings } from "@/lib/settings"
import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/firebase/config"
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore"
import { supabase } from "@/lib/supabase"

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
  const { role, user } = useAuth()
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [saved, setSaved] = useState(false)

  // Load settings from localStorage on client only
  useEffect(() => {
    setSettings(getSavedSettings())
  }, [])

  // Profile image
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // User role management (admin only)
  const [users, setUsers] = useState<{ id: string; email: string; role: string; photoUrl?: string }[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  // Load current profile image - Firestore primary, Supabase fallback
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, "users", user.uid)).then(async (snap) => {
      if (snap.exists() && snap.data().photoUrl) {
        setProfileImage(snap.data().photoUrl)
      } else {
        // fallback: check Supabase profiles table
        const { data } = await supabase
          .from("profiles")
          .select("photo_url")
          .eq("uid", user.uid)
          .single()
        if (data?.photo_url) setProfileImage(data.photo_url)
      }
    })
  }, [user])

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const snap = await getDocs(collection(db, "users"))
      setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as { email: string; role: string; photoUrl?: string }) })))
    } catch (err) {
      console.error("Failed to load users", err)
    } finally {
      setUsersLoading(false)
    }
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    setImageUploading(true)
    try {
      const filePath = `profiles/${user.uid}_${Date.now()}.${file.name.split(".").pop()}`
      const { error: uploadError } = await supabase.storage
        .from("Family_images")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw new Error(uploadError.message)

      const { data } = supabase.storage.from("Family_images").getPublicUrl(filePath)
      const photoUrl = data.publicUrl

      // Save to Firestore
      await updateDoc(doc(db, "users", user.uid), { photoUrl })

      // Save to Supabase DB (upsert into profiles table)
      await supabase.from("profiles").upsert({
        uid: user.uid,
        email: user.email,
        photo_url: photoUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: "uid" })

      setProfileImage(photoUrl)
      toast.success("Profile photo updated")
    } catch (err) {
      console.error("Image upload failed", err)
      toast.error("Failed to upload image")
    } finally {
      setImageUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  useEffect(() => {
    if (role === "admin") void fetchUsers()
  }, [role, fetchUsers])

  const toggleRole = async (uid: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "member" : "admin"
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole })
      await fetchUsers()
      toast.success(`Role updated to ${newRole}`)
    } catch (err) {
      console.error("Failed to update role", err)
      toast.error("Failed to update role")
    }
  }

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
        {/* Profile Photo */}
        <Card title="Profile Photo" subtitle="Upload a photo to personalize your account.">
          <div className="mt-3 flex flex-col items-center gap-4">
            <div
              className="relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100 shadow"
              onClick={() => fileInputRef.current?.click()}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl text-slate-400">
                  👤
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition hover:opacity-100">
                <span className="text-xs font-semibold text-white">Change</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
            >
              {imageUploading ? "Uploading…" : profileImage ? "Change photo" : "Upload photo"}
            </Button>
            {profileImage && (
              <p className="text-xs text-slate-400">Click the photo or button to change it</p>
            )}
          </div>
        </Card>

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

      {/* Admin-only: User Role Management */}
      {role === "admin" && (
        <Card title="User Role Management" subtitle="Change roles for family members. Admin has full access, Member can only view documents.">
          {usersLoading ? (
            <p className="text-sm text-slate-600">Loading users…</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-500">No users found.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{u.email}</p>
                    <span className={`text-xs font-medium ${u.role === "admin" ? "text-violet-600" : "text-slate-500"}`}>
                      {u.role === "admin" ? "👑 Admin" : "👤 Member"}
                    </span>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => toggleRole(u.id, u.role)}>
                    Make {u.role === "admin" ? "Member" : "Admin"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
