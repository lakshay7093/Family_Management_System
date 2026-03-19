"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { signOut } from "firebase/auth"
import { auth, db } from "@/firebase/config"
import { doc, updateDoc } from "firebase/firestore"

const MEMBER_ALLOWED_PATHS = [
  "/dashboard/documents",
  "/dashboard/settings",
  "/dashboard/calendar",
  "/dashboard/chat",
  "/dashboard/notifications",
  "/dashboard/ai",
]

const FAMILY_ROLES = [
  { label: "Papa", emoji: "👨" },
  { label: "Mama", emoji: "👩" },
  { label: "Dada", emoji: "👴" },
  { label: "Dadi", emoji: "👵" },
  { label: "Nana", emoji: "👴" },
  { label: "Nani", emoji: "👵" },
  { label: "Bhai", emoji: "👦" },
  { label: "Behen", emoji: "👧" },
  { label: "Beta", emoji: "🧒" },
  { label: "Beti", emoji: "👧" },
  { label: "Chacha", emoji: "👨" },
  { label: "Chachi", emoji: "👩" },
  { label: "Mama (Uncle)", emoji: "👨" },
  { label: "Mami", emoji: "👩" },
]

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
        <p className="text-sm font-medium text-slate-700">Loading…</p>
      </div>
    </div>
  )
}

function PendingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow text-center space-y-4">
        <div className="text-5xl">⏳</div>
        <h1 className="text-xl font-bold text-slate-900">Not approved by admin till now</h1>
        <p className="text-sm text-slate-500">
          Your registration is under review. You will get access once the admin approves your request.
        </p>
        <button
          onClick={async () => { await signOut(auth); window.location.href = "/login" }}
          className="mt-2 text-sm font-semibold text-red-500 hover:underline"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

function RejectedScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow text-center space-y-4">
        <div className="text-5xl">🚫</div>
        <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
        <p className="text-sm text-slate-500">Your registration has been rejected by the admin.</p>
        <button
          onClick={async () => { await signOut(auth); window.location.href = "/login" }}
          className="text-sm font-semibold text-red-500 hover:underline"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

function FamilyRoleScreen({ userId }: { userId: string }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!selected) return
    setSaving(true)
    await updateDoc(doc(db, "users", userId), { familyRole: selected })
    // Reload so AuthContext picks up the new familyRole
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow space-y-6">
        <div className="text-center space-y-2">
          <div className="text-4xl">👨‍👩‍👧‍👦</div>
          <h1 className="text-xl font-bold text-slate-900">Select your family role</h1>
          <p className="text-sm text-slate-500">Choose how you are related to the family.</p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {FAMILY_ROLES.map((r) => (
            <button
              key={r.label}
              onClick={() => setSelected(r.label)}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-sm font-medium transition
                ${selected === r.label
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-slate-50"
                }`}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={save}
          disabled={!selected || saving}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Continue to Dashboard"}
        </button>
      </div>
    </div>
  )
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, role, status, familyRole, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const redirectedRef = useRef(false)

  useEffect(() => {
    if (loading) return
    if (redirectedRef.current) return
    if (!user) {
      redirectedRef.current = true
      router.push("/login")
      return
    }
    if (role === "member" && status === "approved" && familyRole) {
      const allowed = MEMBER_ALLOWED_PATHS.some((p) => pathname.startsWith(p))
      if (!allowed) {
        redirectedRef.current = true
        router.replace("/dashboard/documents")
      }
    }
  }, [user, role, status, familyRole, loading, router, pathname])

  if (loading) return <LoadingScreen />
  if (!user) return null
  if (role === null) return <LoadingScreen />

  // Pending approval
  if (status === "pending") return <PendingScreen />

  // Rejected
  if (status === "rejected") return <RejectedScreen />

  // Approved but family role not selected yet (skip for admin)
  if (role === "member" && !familyRole) return <FamilyRoleScreen userId={user.uid} />

  return <>{children}</>
}
