"use client"

import { useEffect, useState } from "react"
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

  useEffect(() => {
    if (pathname !== "/dashboard") return

    const settings = getSavedSettings()
    if (settings.defaultStartPage && settings.defaultStartPage !== "/dashboard") {
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
      <div className={`min-h-screen bg-slate-50 ${isSidebarOpen ? "overflow-hidden" : ""}`}>
        <div className="relative flex min-h-screen">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <div className="flex flex-1 flex-col">
            <Navbar
              sidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
            />
            <main className="flex-1 px-4 py-6 md:px-10">
              <div className="mx-auto w-full max-w-6xl">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}