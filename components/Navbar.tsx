"use client"

import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/firebase/config"
import { useAuth } from "@/context/AuthContext"

export default function Navbar() {
  const { user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (err) {
      console.error("Sign out error", err)
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-linear-to-br from-indigo-500 to-sky-500" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Family Dashboard</p>
          <p className="text-xs text-slate-500">Stay on top of what matters</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700">{user?.email ?? "Guest"}</p>
          <p className="text-xs text-slate-500">{user ? "Signed in" : "Not signed in"}</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
