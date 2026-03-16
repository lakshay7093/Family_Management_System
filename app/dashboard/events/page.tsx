"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { db } from "@/firebase/config"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

interface EventItem {
  id: string
  title: string
  date: string
  description: string
  createdAt?: unknown
}

export default function EventsPage() {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [description, setDescription] = useState("")
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null)

  const eventsCollection = useMemo(() => collection(db, "events"), [])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getDocs(eventsCollection)
      const eventList = data.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<EventItem, "id">),
      }))
      setEvents(eventList)
    } catch (err) {
      console.error("Failed to load events", err)
      setError("Unable to load events. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [eventsCollection])

  const addEvent = async () => {
    if (!title.trim() || !date.trim() || !description.trim()) {
      setError("Please provide all event details.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      await addDoc(eventsCollection, {
        title,
        date,
        description,
        createdAt: new Date(),
      })
      setTitle("")
      setDate("")
      setDescription("")
      await fetchEvents()
    } catch (err) {
      console.error("Failed to add event", err)
      setError("Unable to add event. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const eventDoc = doc(db, "events", id)
      await deleteDoc(eventDoc)
      await fetchEvents()
    } catch (err) {
      console.error("Failed to delete event", err)
      setError("Unable to delete event. Please try again.")
    }
  }

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Family Events</h1>
          <p className="mt-2 text-sm text-slate-600">
            Plan gatherings, celebrations, and reminders that matter.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={fetchEvents} size="md">
            Refresh
          </Button>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete event"
        description={
          confirmDelete
            ? `Remove ${confirmDelete.title} from your event list? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return
          void deleteEvent(confirmDelete.id)
          setConfirmDelete(null)
        }}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Add a new event"
          subtitle="Schedule events and keep everyone informed."
          className="max-w-xl"
        >
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g. Family dinner"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Add a note about the event"
                rows={4}
              />
            </label>

            <Button type="button" onClick={addEvent} disabled={saving} className="w-full">
              {saving ? "Saving event..." : "Add event"}
            </Button>
          </div>
        </Card>

        <Card title="Upcoming events" footer={`${events.length} items`}>
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">Loading events…</p>
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
              No events scheduled yet. Create one using the form.
            </div>
          ) : (
            <div className="grid gap-4">
              {events.map((event) => (
                <Card
                  key={event.id}
                  className="p-5"
                  title={event.title}
                  footer={
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setConfirmDelete({ id: event.id, title: event.title })}
                    >
                      Delete
                    </Button>
                  }
                >
                  <p className="text-sm text-slate-600">Date: {event.date}</p>
                  <p className="mt-2 text-sm text-slate-500">{event.description}</p>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
