"use client"

import { useState } from "react"
import { useNotifications } from "@/context/NotificationContext"
import { useAuth } from "@/context/AuthContext"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead, addNotification, refresh } = useNotifications()
  const { role } = useAuth()
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [targetRole, setTargetRole] = useState<"all" | "admin" | "member">("all")
  const [saving, setSaving] = useState(false)

  const send = async () => {
    if (!title.trim() || !message.trim()) return
    setSaving(true)
    await addNotification(title, message, targetRole)
    setTitle(""); setMessage("")
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
        <p className="mt-2 text-sm text-slate-600">Stay updated with family announcements and alerts.</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        {role === "admin" && (
          <Card title="Send notification" subtitle="Broadcast a message to family members.">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g. Reminder" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Message</span>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Write your message..." />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Send to</span>
                <select value={targetRole} onChange={e => setTargetRole(e.target.value as typeof targetRole)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                  <option value="all">Everyone</option>
                  <option value="admin">Admins only</option>
                  <option value="member">Members only</option>
                </select>
              </label>
              <Button onClick={send} disabled={saving} className="w-full">
                {saving ? "Sending..." : "Send notification"}
              </Button>
            </div>
          </Card>
        )}

        <Card title="All notifications" footer={
          notifications.filter(n => !n.read).length > 0 ? (
            <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline">Mark all as read</button>
          ) : null
        }>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <div key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`cursor-pointer rounded-xl border px-4 py-3 transition ${n.read ? "border-slate-100 bg-slate-50" : "border-indigo-200 bg-indigo-50"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${n.read ? "text-slate-700" : "text-slate-900"}`}>{n.title}</p>
                    {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </div>
  )
}
