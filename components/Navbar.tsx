"use client"

import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth, db } from "@/firebase/config"
import { useAuth } from "@/context/AuthContext"
import { doc, getDoc } from "firebase/firestore"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useEffect, useState } from "react"
import NotificationBell from "@/components/NotificationBell"

type NavbarProps = {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export default function Navbar({ sidebarOpen, onToggleSidebar }: NavbarProps) {
  const { user, role } = useAuth()
  const router = useRouter()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, "users", user.uid)).then(async (snap) => {
      if (snap.exists() && snap.data().photoUrl) {
        setPhotoUrl(snap.data().photoUrl)
      } else {
        const { data } = await supabase
          .from("profiles")
          .select("photo_url")
          .eq("uid", user.uid)
          .single()
        if (data?.photo_url) setPhotoUrl(data.photo_url)
      }
    })
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (err) {
      console.error("Sign out error", err)
    }
  }

  return (
    <header className="relative z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:h-20 md:px-6">
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
          <div className="h-10 w-10 overflow-hidden rounded-full bg-linear-to-br from-indigo-500 to-sky-500 shrink-0">
            {photoUrl && (
              <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Family Hub</p>
            <p className="text-xs text-slate-500">{role === "admin" ? "👑 Admin" : "👤 Member"}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-700 truncate max-w-35">{user?.email ?? "Guest"}</p>
          <p className="text-xs text-slate-500">{user ? "Signed in" : "Not signed in"}</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 whitespace-nowrap"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
