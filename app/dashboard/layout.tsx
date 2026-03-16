"use client"

import { useEffect } from "react"
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

  useEffect(() => {
    if (pathname !== "/dashboard") return

    const settings = getSavedSettings()
    if (settings.defaultStartPage && settings.defaultStartPage !== "/dashboard") {
      router.replace(settings.defaultStartPage)
    }
  }, [pathname, router])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <Navbar />
            <main className="flex-1 px-4 py-6 md:px-10">
              <div className="mx-auto w-full max-w-6xl">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}