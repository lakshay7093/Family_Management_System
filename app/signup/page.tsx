"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, db } from "@/firebase/config";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, getCountFromServer, doc, setDoc } from "firebase/firestore";

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignup = async () => {
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError("Please provide both email and password.")
      return
    }

    setLoading(true)
    try {
      // Check if this is the first user — if so, make them admin
      const usersCount = await getCountFromServer(collection(db, "users"))
      const isFirstUser = usersCount.data().count === 0

      const cred = await createUserWithEmailAndPassword(auth, email, password)

      await setDoc(doc(db, "users", cred.user.uid), {
        email: cred.user.email,
        role: isFirstUser ? "admin" : "member",
        createdAt: new Date(),
      })

      // Sign out after registration so user has to login manually
      await signOut(auth)
      setSuccess(true)
      setTimeout(() => router.push("/login"), 1500)
    } catch (err: unknown) {
      console.error("Signup error", err)
      const firebaseError = err as { code?: string; message?: string }
      setError(firebaseError?.message ?? (err instanceof Error ? err.message : "Unexpected error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur">
        <h1 className="text-2xl font-bold text-slate-900">Create a family account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign up to start tracking tasks, expenses, events, and more.
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Account created! Redirecting to login…
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
              autoComplete="new-password"
            />
          </label>

          <button
            type="button"
            onClick={handleSignup}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?
          <Link href="/login" className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
