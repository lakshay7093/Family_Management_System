"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/firebase/config"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { Send, Sparkles } from "lucide-react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

const SYSTEM_PROMPT = `You are a helpful family assistant for a family management app called "Family Hub". 
You help families with:
- Budget planning and expense advice
- Task management suggestions
- Event planning ideas
- Family organization tips
- General advice for family life
Keep responses concise, warm, and practical.`

export default function AIPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm your Family Hub AI assistant. I can help with budgeting, planning events, managing tasks, and more. What can I help you with today?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const buildContext = async () => {
    try {
      const [expSnap, taskSnap, eventSnap] = await Promise.all([
        getDocs(query(collection(db, "expenses"), orderBy("createdAt", "desc"), limit(5))),
        getDocs(query(collection(db, "tasks"), orderBy("createdAt", "desc"), limit(5))),
        getDocs(query(collection(db, "events"), orderBy("createdAt", "desc"), limit(5))),
      ])
      const expenses = expSnap.docs.map(d => d.data())
      const tasks = taskSnap.docs.map(d => d.data())
      const events = eventSnap.docs.map(d => d.data())
      return `\n\nFamily context:\nRecent expenses: ${JSON.stringify(expenses.map(e => ({ title: e.title, amount: e.amount, category: e.category })))}\nRecent tasks: ${JSON.stringify(tasks.map(t => ({ title: t.title, status: t.status })))}\nUpcoming events: ${JSON.stringify(events.map(e => ({ title: e.title, date: e.date })))}`
    } catch {
      return ""
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg: ChatMessage = { role: "user", content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)
    setError(null)

    try {
      const context = await buildContext()
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (!apiKey) throw new Error("AI API key not configured. Add NEXT_PUBLIC_OPENAI_API_KEY to .env.local")

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: SYSTEM_PROMPT + context },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg.content },
          ],
          max_tokens: 500,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message ?? "AI request failed")
      }

      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response."
      setMessages(prev => [...prev, { role: "assistant", content: reply }])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong."
      setError(msg)
      setMessages(prev => [...prev, { role: "assistant", content: `Sorry, I ran into an issue: ${msg}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage() }
  }

  const suggestions = [
    "How can we reduce our monthly expenses?",
    "Suggest a fun family activity for this weekend",
    "Help me plan a birthday party",
    "What tasks should we prioritize this week?",
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <header className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Assistant</h1>
          <p className="text-sm text-slate-600">Your smart family planning companion.</p>
        </div>
      </header>

      <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                  <Sparkles size={12} className="text-white" />
                </div>
              )}
              <div className={`max-w-xs lg:max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-900 rounded-bl-sm"}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                <Sparkles size={12} className="text-white" />
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button key={s} onClick={() => { setInput(s); }}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 transition">
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Ask anything about your family..."
              className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400 text-center">
            Requires <code>NEXT_PUBLIC_OPENAI_API_KEY</code> in .env.local
          </p>
        </div>
      </div>
    </div>
  )
}
