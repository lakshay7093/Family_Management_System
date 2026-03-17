"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

const MEMBER_ALLOWED_PATHS = [
  "/dashboard/documents",
  "/dashboard/settings",
  "/dashboard/calendar",
  "/dashboard/chat",
  "/dashboard/notifications",
  "/dashboard/ai",
]

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth()
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

    if (role === "member") {
      const allowed = MEMBER_ALLOWED_PATHS.some((p) => pathname.startsWith(p))
      if (!allowed) {
        redirectedRef.current = true
        router.replace("/dashboard/documents")
      }
    }
  }, [user, role, loading, router, pathname])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-700">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // Wait for role to load before rendering (prevents flash/blank on mobile)
  if (role === null) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
        <p className="text-sm font-medium text-slate-700">Loading…</p>
      </div>
    </div>
  )

  return <>{children}</>
}
