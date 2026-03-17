"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { db } from "@/firebase/config"
import { useAuth } from "@/context/AuthContext"
import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp
} from "firebase/firestore"
import { Send } from "lucide-react"

interface Message {
  id: string
  text: string
  senderEmail: string
  senderRole: string
  createdAt: Timestamp | null
}

export default function ChatPage() {
  const { user, role } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const messagesCol = useMemo(() => collection(db, "family_chat"), [])

  useEffect(() => {
    const q = query(messagesCol, orderBy("createdAt", "asc"))
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Message, "id">) })))
    })
    return () => unsub()
  }, [messagesCol])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!text.trim() || !user) return
    setSending(true)
    try {
      await addDoc(messagesCol, {
        text: text.trim(),
        senderEmail: user.email ?? "Unknown",
        senderRole: role ?? "member",
        createdAt: serverTimestamp(),
      })
      setText("")
    } finally {
      setSending(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  const formatTime = (ts: Timestamp | null) => {
    if (!ts) return ""
    const d = ts.toDate()
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Family Chat</h1>
        <p className="mt-1 text-sm text-slate-600">Real-time chat for the whole family.</p>
      </header>

      <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-slate-400">No messages yet. Say hello 👋</p>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.senderEmail === user?.email
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 ${isMe ? "bg-indigo-600 text-white rounded-br-sm" : "bg-slate-100 text-slate-900 rounded-bl-sm"}`}>
                  {!isMe && (
                    <p className="text-xs font-semibold mb-1 text-indigo-600">
                      {msg.senderEmail.split("@")[0]} {msg.senderRole === "admin" ? "👑" : ""}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-indigo-200" : "text-slate-400"} text-right`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-end gap-3">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Type a message... (Enter to send)"
              className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !text.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
