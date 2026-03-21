"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/firebase/config"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { Send, Sparkles, RotateCcw } from "lucide-react"

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

const suggestions = [
  { icon: "💸", text: "How can we reduce monthly expenses?" },
  { icon: "🎉", text: "Help me plan a birthday party" },
  { icon: "📋", text: "What tasks should we prioritize?" },
  { icon: "🏕️", text: "Suggest a fun family activity" },
]

export default function AIPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

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

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: ChatMessage = { role: "user", content }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)
    setError(null)

    if (textareaRef.current) textareaRef.current.style.height = "auto"

    try {
      const context = await buildContext()
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey) throw new Error("AI API key not configured.")

      const history = [...messages, userMsg].slice(0, -1).map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }))

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT + context }] },
            contents: [
              ...history,
              { role: "user", parts: [{ text: content }] },
            ],
          }),
        }
      )

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message ?? "AI request failed")
      }

      const data = await res.json()
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a response."
      setMessages(prev => [...prev, { role: "assistant", content: reply }])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage() }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  const reset = () => {
    setMessages([])
    setError(null)
    setInput("")
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">AI Assistant</h1>
            <p className="text-xs text-slate-500">Powered by Google Gemini</p>
          </div>
        </div>
        {!isEmpty && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition"
          >
            <RotateCcw size={12} />
            New chat
          </button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Sparkles size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">How can I help your family?</h2>
                <p className="mt-1 text-sm text-slate-500 max-w-xs">
                  Ask me anything about budgeting, planning, tasks, or family life.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                {suggestions.map(s => (
                  <button
                    key={s.text}
                    onClick={() => void sendMessage(s.text)}
                    className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition"
                  >
                    <span className="text-base leading-none mt-0.5">{s.icon}</span>
                    <span className="leading-snug">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mt-1">
                  <Sparkles size={12} className="text-white" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"}`}
              >
                {msg.role === "assistant" ? (
                  <span dangerouslySetInnerHTML={{ __html:
                    msg.content
                      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.+?)\*/g, "<em>$1</em>")
                      .replace(/\n/g, "<br/>")
                  }} />
                ) : msg.content}
              </div>
              {msg.role === "user" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 mt-1 text-xs font-bold text-indigo-600">
                  {user?.email?.[0].toUpperCase() ?? "U"}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mt-1">
                <Sparkles size={12} className="text-white" />
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3.5">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-100 bg-white p-4">
          <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Ask anything about your family..."
              className="flex-1 resize-none bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              style={{ maxHeight: "120px" }}
            />
            <button
              onClick={() => void sendMessage()}
              disabled={loading || !input.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-slate-400">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
