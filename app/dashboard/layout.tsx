"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Navbar from "@/components/Navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { getSavedSettings } from "@/lib/settings"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const redirectedRef = useRef(false)

  useEffect(() => {
    if (pathname !== "/dashboard") return
    if (redirectedRef.current) return

    const settings = getSavedSettings()
    if (settings.defaultStartPage && settings.defaultStartPage !== "/dashboard") {
      redirectedRef.current = true
      router.replace(settings.defaultStartPage)
    }
  }, [pathname, router])

  // Close the mobile sidebar when navigation changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(false)
  }, [pathname])


  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-slate-50">
        {/* Navbar */}
        <Navbar
          sidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />

        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          {/* Main content */}
          <main className="flex-1 min-w-0 px-4 py-6 md:px-10">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}