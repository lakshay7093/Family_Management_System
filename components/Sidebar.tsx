"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Members", href: "/dashboard/members" },
  { label: "Tasks", href: "/dashboard/tasks" },
  { label: "Expenses", href: "/dashboard/expenses" },
  { label: "Events", href: "/dashboard/events" },
  { label: "Documents", href: "/dashboard/documents" },
  { label: "Settings", href: "/dashboard/settings" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-8 bg-slate-950 p-6 text-white md:flex">
      <div>
        <p className="text-lg font-bold tracking-wide">Family Hub</p>
        <p className="mt-1 text-sm text-slate-300">Manage members, tasks, expenses & more.</p>
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
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto text-xs text-slate-400">
        Tip: Use the sidebar to navigate between sections.
      </div>
    </aside>
  )
}
