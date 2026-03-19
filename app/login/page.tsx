"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { auth, db } from "@/firebase/config"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)

  const handleLogin = async () => {
    setError(null)
    setPending(false)
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.")
      return
    }
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)

      // Check approval status — if no status field, treat as approved (existing users)
      const userDoc = await getDoc(doc(db, "users", cred.user.uid))
      const status = userDoc.data()?.status ?? "approved"

      if (status === "pending") {
        // Sign them out immediately
        await signOut(auth)
        setPending(true)
        return
      }

      if (status === "rejected") {
        await signOut(auth)
        setError("Your registration has been rejected by the admin.")
        return
      }

      router.push("/dashboard")
    } catch (err: unknown) {
      const firebaseError = err as { message?: string }
      setError(firebaseError?.message ?? "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  if (pending) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur text-center space-y-4">
          <div className="text-5xl">⏳</div>
          <h1 className="text-xl font-bold text-slate-900">Approval pending</h1>
          <p className="text-sm text-slate-600">
            Your account is awaiting admin approval. Please check back later.
          </p>
          <button
            onClick={() => setPending(false)}
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            Try another account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to your account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use your email and password to access your family dashboard.
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
