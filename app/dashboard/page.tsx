"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/firebase/config"
import { collection, getCountFromServer } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import Button from "@/components/ui/Button"

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

type DashboardCounts = {
  members: number
  tasks: number
  expenses: number
  events: number
  documents: number
}

const adminCards = [
  {
    key: "members" as keyof DashboardCounts,
    title: "Family Members",
    description: "Add and manage each member in your family.",
    href: "/dashboard/members",
    icon: "👨‍👩‍👧‍👦",
    color: "from-violet-500 to-purple-600",
  },
  {
    key: "tasks" as keyof DashboardCounts,
    title: "Tasks",
    description: "Assign, track, and complete shared chores.",
    href: "/dashboard/tasks",
    icon: "✅",
    color: "from-blue-500 to-indigo-600",
  },
  {
    key: "expenses" as keyof DashboardCounts,
    title: "Expenses",
    description: "Keep tabs on shared expenses and payments.",
    href: "/dashboard/expenses",
    icon: "💰",
    color: "from-emerald-500 to-teal-600",
  },
  {
    key: "events" as keyof DashboardCounts,
    title: "Events",
    description: "Plan birthdays, trips, and family gatherings.",
    href: "/dashboard/events",
    icon: "🎉",
    color: "from-orange-500 to-amber-600",
  },
  {
    key: "documents" as keyof DashboardCounts,
    title: "Documents",
    description: "Store important files and quick links.",
    href: "/dashboard/documents",
    icon: "📄",
    color: "from-rose-500 to-pink-600",
  },
]

const extraCards = [
  { title: "Expense Split", description: "Split costs and track who owes what.", href: "/dashboard/split", icon: "🤝", color: "from-cyan-500 to-blue-600" },
  { title: "Calendar", description: "Visual calendar of all family events.", href: "/dashboard/calendar", icon: "📅", color: "from-fuchsia-500 to-pink-600" },
  { title: "Family Chat", description: "Real-time chat for the whole family.", href: "/dashboard/chat", icon: "💬", color: "from-green-500 to-emerald-600" },
  { title: "Notifications", description: "Send and receive family announcements.", href: "/dashboard/notifications", icon: "🔔", color: "from-yellow-500 to-orange-500" },
  { title: "AI Assistant", description: "Smart family planning companion.", href: "/dashboard/ai", icon: "✨", color: "from-violet-500 to-indigo-600" },
]

function AdminDashboard() {
  const { user } = useAuth()
  const [counts, setCounts] = useState<DashboardCounts>({
    members: 0, tasks: 0, expenses: 0, events: 0, documents: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshCounts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [members, tasks, expenses, events, documents] = await Promise.all([
        getCountFromServer(collection(db, "members")),
        getCountFromServer(collection(db, "tasks")),
        getCountFromServer(collection(db, "expenses")),
        getCountFromServer(collection(db, "events")),
        getCountFromServer(collection(db, "documents")),
      ])
      setCounts({
        members: members.data().count,
        tasks: tasks.data().count,
        expenses: expenses.data().count,
        events: events.data().count,
        documents: documents.data().count,
      })
    } catch (err) {
      console.error("Failed to load dashboard counts", err)
      setError("Unable to load dashboard stats. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshCounts()
  }, [refreshCounts])

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Welcome back, {user?.email}. Here&apos;s your family overview.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/members"
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            Manage members
          </Link>
          <Button variant="secondary" onClick={refreshCounts} size="md">
            Refresh stats
          </Button>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-3">
        {adminCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-2xl shadow`}>
                {card.icon}
              </div>
              <span className="text-2xl font-bold text-slate-800">
                {loading ? "—" : counts[card.key]}
              </span>
            </div>
            <div className="mt-4">
              <h2 className="text-base font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{card.description}</p>
            </div>
            <p className="mt-4 text-sm font-medium text-indigo-600 group-hover:underline">
              Go to {card.title.toLowerCase()} →
            </p>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { label: "+ Add Member", href: "/dashboard/members" },
            { label: "+ New Task", href: "/dashboard/tasks" },
            { label: "+ Log Expense", href: "/dashboard/expenses" },
            { label: "+ Schedule Event", href: "/dashboard/events" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-4">New Features</h2>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          {extraCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-xl shadow`}>
                {card.icon}
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{card.description}</p>
              </div>
              <p className="mt-3 text-xs font-medium text-indigo-600 group-hover:underline">Open →</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── Member Dashboard ─────────────────────────────────────────────────────────

function MemberDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome 👋</h1>
        <p className="mt-2 text-sm text-slate-600">
          Hello, {user?.email}. You can view and add family documents below.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center space-y-4">
        <div className="text-5xl">📄</div>
        <h2 className="text-xl font-semibold text-slate-900">Family Documents</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Access important family documents, links, and notes shared by your family admin.
        </p>
        <Link
          href="/dashboard/documents"
          className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Go to Documents →
        </Link>
      </div>
    </div>
  )
}

// ─── Root Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && role === "member") {
      router.replace("/dashboard/documents")
    }
  }, [role, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
          <p className="text-sm text-slate-600">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  if (role === "admin") return <AdminDashboard />

  // member — redirect is happening via useEffect, show nothing meanwhile
  return null
}
