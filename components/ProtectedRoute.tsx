"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {

  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {

    if (!loading && !user) {
      router.push("/login")
    }

  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-700">Checking authentication…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}