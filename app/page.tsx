"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

const features = [
  { icon: "📋", title: "Tasks", desc: "Assign and track family tasks with ease.", color: "bg-blue-50 text-blue-600" },
  { icon: "💸", title: "Expenses", desc: "Split bills and manage shared expenses.", color: "bg-green-50 text-green-600" },
  { icon: "📅", title: "Events", desc: "Never miss a family event or occasion.", color: "bg-orange-50 text-orange-600" },
  { icon: "💬", title: "Chat", desc: "Stay connected with your family in real-time.", color: "bg-pink-50 text-pink-600" },
  { icon: "📄", title: "Documents", desc: "Store and share important family documents.", color: "bg-purple-50 text-purple-600" },
  { icon: "🤖", title: "AI Assistant", desc: "Get smart suggestions powered by AI.", color: "bg-violet-50 text-violet-600" },
]

const steps = [
  { step: "01", title: "Create an account", desc: "Sign up with email or Google in seconds." },
  { step: "02", title: "Admin approves", desc: "Your family admin reviews and approves your request." },
  { step: "03", title: "Access everything", desc: "Log in and start managing your family together." },
]

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (user) router.replace("/dashboard")
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-700">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
            <span className="text-2xl">🏠</span>
            <span>Family <span className="text-indigo-600">Hub</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
              Sign In
            </Link>
            <Link href="/signup" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-20 text-center overflow-hidden">
        {/* bg decoration */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-150 w-150 rounded-full bg-indigo-100 opacity-40 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-100 opacity-30 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-sky-100 opacity-30 blur-3xl" />
        </div>

        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Your Family. One Place.
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
            Manage your family <br />
            <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">together</span>
          </h1>

          <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
            Tasks, expenses, events, chat — everything your family needs in one simple, secure, and private dashboard.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup"
              className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">
              Create Family Account →
            </Link>
            <Link href="/login"
              className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition">
              Sign In
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">✅ Free to use</span>
            <span className="flex items-center gap-1.5">🔒 Private & secure</span>
            <span className="flex items-center gap-1.5">👑 Admin controlled</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Everything your family needs</h2>
            <p className="mt-3 text-slate-500 text-sm max-w-md mx-auto">All the tools to keep your family organized, connected, and on the same page.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">How it works</h2>
            <p className="mt-3 text-slate-500 text-sm">Get your family set up in just a few steps.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-[60%] w-full h-px border-t-2 border-dashed border-slate-200" />
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-200 mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-6 mb-16">
        <div className="mx-auto max-w-4xl rounded-3xl bg-linear-to-br from-indigo-600 to-purple-600 px-8 py-16 text-center shadow-xl shadow-indigo-200">
          <h2 className="text-3xl font-bold text-white">Ready to bring your family together?</h2>
          <p className="mt-3 text-indigo-200 text-sm">Sign up in seconds. Admin approves members to keep it private.</p>
          <Link href="/signup"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-600 shadow hover:bg-indigo-50 transition">
            Get Started for Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Family Hub. Built with ❤️ for families.
      </footer>

    </div>
  )
}
