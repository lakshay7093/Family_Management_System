"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { db } from "@/firebase/config"
import { collection, getCountFromServer } from "firebase/firestore"
import Button from "@/components/ui/Button"

type DashboardCounts = {
  members: number
  tasks: number
  expenses: number
  events: number
  documents: number
}

type DashboardCardKey = keyof DashboardCounts | "documents"

const cards: Array<{
  key: DashboardCardKey
  title: string
  description: string
  href: string
}> = [
  {
    key: "members",
    title: "Family Members",
    description: "Add and manage each member in your family.",
    href: "/dashboard/members",
  },
  {
    key: "tasks",
    title: "Tasks",
    description: "Assign, track, and complete shared chores.",
    href: "/dashboard/tasks",
  },
  {
    key: "expenses",
    title: "Expenses",
    description: "Keep tabs on shared expenses and payments.",
    href: "/dashboard/expenses",
  },
  {
    key: "events",
    title: "Events",
    description: "Plan birthdays, trips, and family gatherings.",
    href: "/dashboard/events",
  },
  {
    key: "documents",
    title: "Documents",
    description: "Store important files and quick links.",
    href: "/dashboard/documents",
  },
]

export default function Dashboard() {
  const [counts, setCounts] = useState<DashboardCounts>({
    members: 0,
    tasks: 0,
    expenses: 0,
    events: 0,
    documents: 0,
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Family Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Get a snapshot of what’s happening with your family in one place.
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
        {cards.map((card) => {
          const count = counts[card.key as keyof DashboardCounts]
          const countLabel = loading ? "Loading…" : `${count} ${card.key}`

          return (
            <Link
              key={card.href}
              href={card.href}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{card.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-indigo-600">Go to {card.title.toLowerCase()}</p>
                <p className="text-xs font-medium text-slate-500">{countLabel}</p>
              </div>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
