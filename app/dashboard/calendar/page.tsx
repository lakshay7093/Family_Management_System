"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { db } from "@/firebase/config"
import { collection, getDocs } from "firebase/firestore"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface EventItem {
  id: string
  title: string
  date: string
  description: string
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

export default function CalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [today] = useState(new Date())
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState<string | null>(null)

  const eventsCol = useMemo(() => collection(db, "events"), [])

  const fetchEvents = useCallback(async () => {
    const snap = await getDocs(eventsCol)
    setEvents(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<EventItem, "id">) })))
  }, [eventsCol])

  useEffect(() => { void fetchEvents() }, [fetchEvents])

  const year = current.getFullYear()
  const month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const eventsByDate = useMemo(() => {
    const map: Record<string, EventItem[]> = {}
    events.forEach(e => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    return map
  }, [events])

  const selectedEvents = selected ? (eventsByDate[selected] ?? []) : []

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Family Calendar</h1>
        <p className="mt-2 text-sm text-slate-600">View all scheduled family events at a glance.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrent(new Date(year, month - 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition">
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-base font-semibold text-slate-900">{MONTHS[month]} {year}</h2>
            <button onClick={() => setCurrent(new Date(year, month + 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              const hasEvents = !!eventsByDate[dateStr]
              const isToday = dateStr === todayStr
              const isSelected = dateStr === selected
              return (
                <button key={dateStr} onClick={() => setSelected(isSelected ? null : dateStr)}
                  className={`relative flex flex-col items-center justify-start rounded-xl p-2 text-sm transition min-h-[48px]
                    ${isSelected ? "bg-indigo-600 text-white" : isToday ? "bg-indigo-50 text-indigo-700 font-semibold" : "hover:bg-slate-50 text-slate-700"}`}>
                  <span>{day}</span>
                  {hasEvents && (
                    <span className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-indigo-500"}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            {selected ? `Events on ${selected}` : "Select a date"}
          </h3>
          {!selected ? (
            <p className="text-sm text-slate-500">Click a date to see events.</p>
          ) : selectedEvents.length === 0 ? (
            <p className="text-sm text-slate-500">No events on this day.</p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map(e => (
                <div key={e.id} className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{e.description}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Upcoming</h4>
            {events.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5).map(e => (
              <div key={e.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="shrink-0 rounded-lg bg-indigo-100 px-2 py-1 text-center">
                  <p className="text-xs font-bold text-indigo-700">{new Date(e.date + "T00:00:00").getDate()}</p>
                  <p className="text-[10px] text-indigo-500">{MONTHS[new Date(e.date + "T00:00:00").getMonth()].slice(0, 3)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{e.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{e.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
