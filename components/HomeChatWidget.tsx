"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Send, Sparkles, X, MessageCircle, RotateCcw } from "lucide-react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

const SESSION_LIMIT_MS = 90 * 1000 // 90 seconds

const SYSTEM_PROMPT = `You are a helpful family assistant for a family management app called "Family Hub". 
You help families with budget planning, task management, event planning, and family organization tips.
Keep responses concise, warm, and practical. You are a demo assistant — encourage users to sign up for full access.`

const suggestions = [
  { icon: "💸", text: "How can we reduce monthly expenses?" },
  { icon: "🎉", text: "Help me plan a birthday party" },
  { icon: "📋", text: "Tips for family task management?" },
  { icon: "🏕️", text: "Suggest a fun family activity" },
]

export default function HomeChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [timeLeft, setTimeLeft] = useState(SESSION_LIMIT_MS)
  const [sessionStarted, setSessionStarted] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionStartRef = useRef<number | null>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // Session countdown timer
  useEffect(() => {
    if (!sessionStarted || sessionExpired) return

    sessionStartRef.current = Date.now()

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - (sessionStartRef.current ?? Date.now())
      const remaining = SESSION_LIMIT_MS - elapsed

      if (remaining <= 0) {
        setTimeLeft(0)
        setSessionExpired(true)
        if (timerRef.current) clearInterval(timerRef.current)
      } else {
        setTimeLeft(remaining)
      }
    }, 500)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [sessionStarted, sessionExpired])

  const formatTime = (ms: number) => {
    const s = Math.ceil(ms / 1000)
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  const sendMessage = async (text?: string) => {
    if (sessionExpired) return
    const content = (text ?? input).trim()
    if (!content || loading) return

    // Start session timer on first message
    if (!sessionStarted) setSessionStarted(true)

    const userMsg: ChatMessage = { role: "user", content }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)
    setError(null)

    if (textareaRef.current) textareaRef.current.style.height = "auto"

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey) throw new Error("AI not configured.")

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
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
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
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`
  }

  const resetSession = () => {
    setMessages([])
    setError(null)
    setInput("")
    setSessionExpired(false)
    setSessionStarted(false)
    setTimeLeft(SESSION_LIMIT_MS)
    sessionStartRef.current = null
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const isEmpty = messages.length === 0

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-white shadow-lg shadow-indigo-300 hover:bg-indigo-700 transition-all duration-200 ${open ? "hidden" : "flex"}`}
      >
        <MessageCircle size={20} />
        <span className="text-sm font-semibold">Try AI Assistant</span>
        <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300 overflow-hidden"
          style={{ height: "520px" }}>

          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                <Sparkles size={15} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Assistant</p>
                <p className="text-xs text-indigo-200">Powered by Gemini · Demo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Timer */}
              {sessionStarted && !sessionExpired && (
                <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${timeLeft < 20000 ? "bg-red-500/30 text-red-100" : "bg-white/20 text-white"}`}>
                  ⏱ {formatTime(timeLeft)}
                </div>
              )}
              {!isEmpty && (
                <button onClick={resetSession} className="rounded-lg p-1 text-white/70 hover:text-white hover:bg-white/10 transition">
                  <RotateCcw size={14} />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-white/70 hover:text-white hover:bg-white/10 transition">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Session expired modal overlay */}
          {sessionExpired && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm px-6 text-center gap-4">
              <div className="text-5xl">⏰</div>
              <h3 className="text-lg font-bold text-slate-900">Demo session ended</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Your free preview has ended. Sign up or log in to get <span className="font-semibold text-indigo-600">unlimited AI access</span> with your family data.
              </p>
              <div className="flex flex-col w-full gap-2 mt-2">
                <Link
                  href="/signup"
                  className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Create Free Account →
                </Link>
                <Link
                  href="/login"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Sign In
                </Link>
                <button
                  onClick={resetSession}
                  className="text-xs text-slate-400 hover:text-slate-600 transition mt-1"
                >
                  Restart demo session
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isEmpty && !sessionExpired && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow">
                  <Sparkles size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Ask me anything!</h3>
                  <p className="mt-1 text-xs text-slate-500">Try a question below to start your demo</p>
                </div>
                <div className="grid grid-cols-2 gap-1.5 w-full">
                  {suggestions.map(s => (
                    <button
                      key={s.text}
                      onClick={() => void sendMessage(s.text)}
                      className="flex items-start gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 transition"
                    >
                      <span className="text-sm leading-none mt-0.5">{s.icon}</span>
                      <span className="leading-snug">{s.text}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  ⏱ You have {formatTime(SESSION_LIMIT_MS)} of free demo access
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mt-1">
                    <Sparkles size={10} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed
                  ${msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"}`}
                >
                  {msg.role === "assistant" ? (
                    <span dangerouslySetInnerHTML={{ __html:
                      msg.content
                        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\n/g, "<br/>")
                    }} />
                  ) : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mt-1">
                  <Sparkles size={10} className="text-white" />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-3">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {!sessionExpired && (
            <div className="border-t border-slate-100 bg-white p-3">
              <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKey}
                  rows={1}
                  placeholder="Ask anything..."
                  className="flex-1 resize-none bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                  style={{ maxHeight: "80px" }}
                />
                <button
                  onClick={() => void sendMessage()}
                  disabled={loading || !input.trim()}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
