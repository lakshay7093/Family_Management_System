"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

const adminNavItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Members", href: "/dashboard/members" },
  { label: "Tasks", href: "/dashboard/tasks" },
  { label: "Expenses", href: "/dashboard/expenses" },
  { label: "Events", href: "/dashboard/events" },
  { label: "Documents", href: "/dashboard/documents" },
  { label: "Settings", href: "/dashboard/settings" },
]

const memberNavItems = [
  { label: "My Documents", href: "/dashboard/documents" },
  { label: "Settings", href: "/dashboard/settings" },
]

type SidebarProps = {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { role } = useAuth()

  const navItems = role === "admin" ? adminNavItems : memberNavItems

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex w-64 shrink-0 flex-col gap-8 bg-slate-950 p-6 text-white shadow-xl transition-transform duration-200 md:static md:top-auto md:bottom-auto md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-bold tracking-wide">Family Hub</p>
            <p className="mt-1 text-xs text-slate-400 capitalize">
              {role === "admin" ? "👑 Admin" : "👤 Member"}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 md:hidden"
              aria-label="Close navigation"
            >
              <span className="text-lg">×</span>
            </button>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-800 text-white shadow"
                    : "text-slate-200 hover:bg-slate-800/70 hover:text-white"
                }`}
                onClick={onClose}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto text-xs text-slate-400">
          {role === "admin"
            ? "Admin panel — full access."
            : "You can view and add documents."}
        </div>
      </aside>
    </>
  )
}
