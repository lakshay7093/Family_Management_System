"use client"

import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/firebase/config"
import { useAuth } from "@/context/AuthContext"

type NavbarProps = {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export default function Navbar({ sidebarOpen, onToggleSidebar }: NavbarProps) {
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
    <header className="relative z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200 md:hidden"
          aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
        >
          {sidebarOpen ? (
            <span className="text-lg font-bold">×</span>
          ) : (
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-linear-to-br from-indigo-500 to-sky-500" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Family Dashboard</p>
            <p className="text-xs text-slate-500">Stay on top of what matters</p>
          </div>
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
