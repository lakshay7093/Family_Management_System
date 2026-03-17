"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { X } from "lucide-react"

const adminNavItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Members", href: "/dashboard/members" },
  { label: "Tasks", href: "/dashboard/tasks" },
  { label: "Expenses", href: "/dashboard/expenses" },
  { label: "Expense Split", href: "/dashboard/split" },
  { label: "Events", href: "/dashboard/events" },
  { label: "Calendar", href: "/dashboard/calendar" },
  { label: "Documents", href: "/dashboard/documents" },
  { label: "Chat", href: "/dashboard/chat" },
  { label: "Notifications", href: "/dashboard/notifications" },
  { label: "AI Assistant", href: "/dashboard/ai" },
  { label: "Settings", href: "/dashboard/settings" },
]

const memberNavItems = [
  { label: "My Documents", href: "/dashboard/documents" },
  { label: "Calendar", href: "/dashboard/calendar" },
  { label: "Chat", href: "/dashboard/chat" },
  { label: "Notifications", href: "/dashboard/notifications" },
  { label: "AI Assistant", href: "/dashboard/ai" },
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
      {/* Mobile backdrop — only visible when open */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-40 flex h-full w-72 flex-col bg-slate-950 text-white shadow-2xl
          transition-transform duration-300 ease-in-out
          md:sticky md:top-0 md:h-screen md:w-64 md:translate-x-0 md:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <p className="text-base font-bold tracking-wide">Family Hub</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {role === "admin" ? "👑 Admin" : "👤 Member"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 md:hidden"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links — scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">
          {role === "admin" ? "Full admin access" : "Member access"}
        </div>
      </aside>
    </>
  )
}
