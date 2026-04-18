"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import HomeChatWidget from "@/components/HomeChatWidget"

const features = [
  { icon: "📋", title: "Task Management", desc: "Assign, track, and complete family tasks with priorities and deadlines.", color: "bg-blue-50 text-blue-600", border: "hover:border-blue-200" },
  { icon: "💸", title: "Expense Tracking", desc: "Split bills, log shared expenses, and stay on top of your family budget.", color: "bg-emerald-50 text-emerald-600", border: "hover:border-emerald-200" },
  { icon: "📅", title: "Family Calendar", desc: "Schedule events, birthdays, and appointments — all in one place.", color: "bg-orange-50 text-orange-600", border: "hover:border-orange-200" },
  { icon: "💬", title: "Real-time Chat", desc: "Stay connected with instant messaging for the whole family.", color: "bg-pink-50 text-pink-600", border: "hover:border-pink-200" },
  { icon: "📄", title: "Document Vault", desc: "Securely store and share important family documents anytime.", color: "bg-purple-50 text-purple-600", border: "hover:border-purple-200" },
  { icon: "🤖", title: "AI Assistant", desc: "Get smart, personalized suggestions powered by Google Gemini.", color: "bg-violet-50 text-violet-600", border: "hover:border-violet-200" },
]

const steps = [
  { step: "01", title: "Create an account", desc: "Sign up with your email or Google account in seconds." },
  { step: "02", title: "Get approved", desc: "Your family admin reviews and approves your membership." },
  { step: "03", title: "Access everything", desc: "Log in and start managing your family life together." },
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">

      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 select-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-base shadow-sm">🏠</div>
            <span className="font-bold text-base text-slate-900">Family <span className="text-indigo-600">Hub</span></span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 rounded-lg hover:bg-slate-50">
              Sign in
            </Link>
            <Link href="/signup" className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-16 pb-24 text-center overflow-hidden">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="absolute bottom-0 right-[-5%] h-96 w-96 rounded-full bg-purple-100/50 blur-3xl" />
          <div className="absolute bottom-0 left-[-5%] h-96 w-96 rounded-full bg-sky-100/50 blur-3xl" />
        </div>

        <div className="relative w-full max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Your Family. One Place. Always Connected.
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
            Manage your family
            <br />
            <span className="text-indigo-600">smarter, together</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Tasks, expenses, events, chat, documents — everything your family needs in one simple, secure, and private dashboard.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all duration-200">
              Create Family Account →
            </Link>
            <Link href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
              Sign in to Dashboard
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> Free to use</span>
            <span className="h-3 w-px bg-slate-200 hidden sm:block" />
            <span className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> No credit card required</span>
            <span className="h-3 w-px bg-slate-200 hidden sm:block" />
            <span className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> Admin-controlled & private</span>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {[
              { value: "6+", label: "Features" },
              { value: "100%", label: "Private" },
              { value: "Free", label: "Forever" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-4 shadow-sm text-center">
                <p className="text-2xl font-extrabold text-indigo-600">{s.value}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-slate-50 border-y border-slate-100">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <span className="inline-block rounded-full bg-white border border-slate-200 px-4 py-1 text-xs font-semibold text-indigo-600 mb-4 shadow-sm">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Everything your family needs
            </h2>
            <p className="mt-4 text-slate-500 text-base max-w-lg mx-auto leading-relaxed">
              All the tools to keep your family organized, connected, and on the same page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title}
                className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default ${f.border}`}>
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

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <span className="inline-block rounded-full bg-slate-50 border border-slate-200 px-4 py-1 text-xs font-semibold text-indigo-600 mb-4">
              How it works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Up and running in minutes
            </h2>
            <p className="mt-4 text-slate-500 text-base">Three simple steps to get your family started.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-[60%] w-full h-px border-t-2 border-dashed border-slate-200" />
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-100 mb-5 shrink-0">
                  {s.step}
                </div>
                <h3 className="font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-6 py-16 bg-slate-50 border-t border-slate-100">
        <div className="mx-auto max-w-5xl rounded-3xl bg-indigo-600 px-8 py-16 text-center relative overflow-hidden shadow-xl shadow-indigo-200">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 blur-2xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to bring your family together?
            </h2>
            <p className="mt-4 text-indigo-200 text-base max-w-md mx-auto">
              Sign up in seconds. Admin approves members to keep your space private and secure.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-indigo-600 shadow hover:bg-indigo-50 transition-all duration-200">
                Get Started for Free →
              </Link>
              <Link href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-all duration-200">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2 select-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm">🏠</div>
              <span className="font-bold text-slate-900">Family <span className="text-indigo-600">Hub</span></span>
            </Link>

            {/* Nav */}
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
              <Link href="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
              <Link href="/signup" className="hover:text-slate-900 transition-colors">Sign Up</Link>
            </div>

            {/* Creator */}
            <div className="text-center md:text-right space-y-0.5">
              <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} Family Hub · Made by{" "}
                <span className="font-semibold text-slate-600">Lakshay Saini</span>
              </p>
              <a href="mailto:lakshaycr8244@gmail.com"
                className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                lakshaycr8244@gmail.com
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            Built with ❤️ for families · Powered by Next.js &amp; Firebase
          </div>
        </div>
      </footer>

      {/* AI Chat Widget */}
      <HomeChatWidget />

    </div>
  )
}
