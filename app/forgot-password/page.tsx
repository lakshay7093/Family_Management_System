"use client"

import Link from "next/link"
import { useState } from "react"
import { auth } from "@/firebase/config"
import { sendPasswordResetEmail } from "firebase/auth"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    setError(null)
    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setSent(true)
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (e.code === "auth/user-not-found") {
        setError("No account found with this email address.")
      } else if (e.code === "auth/invalid-email") {
        setError("Please enter a valid email address.")
      } else {
        setError(e.message ?? "Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur text-center space-y-4">
          <div className="text-5xl">📧</div>
          <h1 className="text-xl font-bold text-slate-900">Check your email</h1>
          <p className="text-sm text-slate-600">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-semibold text-slate-800">{email}</span>.
            Please check your inbox and follow the instructions.
          </p>
          <p className="text-xs text-slate-400">
            Didn&apos;t receive it? Check your spam folder.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => { setSent(false); setEmail("") }}
              className="text-sm font-semibold text-indigo-600 hover:underline"
            >
              Try a different email
            </button>
            <Link
              href="/login"
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur">
        <div className="text-4xl mb-4">🔑</div>
        <h1 className="text-2xl font-bold text-slate-900">Forgot your password?</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReset()}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
          </label>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
