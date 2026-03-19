"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { auth, db } from "@/firebase/config"
import { createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { collection, getCountFromServer, doc, setDoc } from "firebase/firestore"

export default function Signup() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignup = async () => {
    setError(null)
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all fields.")
      return
    }
    setLoading(true)
    try {
      const usersCount = await getCountFromServer(collection(db, "users"))
      const isFirstUser = usersCount.data().count === 0

      const cred = await createUserWithEmailAndPassword(auth, email, password)

      await setDoc(doc(db, "users", cred.user.uid), {
        name: name.trim(),
        email: cred.user.email,
        // First user is admin and auto-approved, rest are pending
        role: isFirstUser ? "admin" : "member",
        status: isFirstUser ? "approved" : "pending",
        createdAt: new Date(),
      })

      await signOut(auth)

      setSuccess(true)
    } catch (err: unknown) {
      const firebaseError = err as { message?: string }
      setError(firebaseError?.message ?? "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur text-center space-y-4">
          <div className="text-5xl">⏳</div>
          <h1 className="text-xl font-bold text-slate-900">Registration submitted!</h1>
          <p className="text-sm text-slate-600">
            Your account is pending admin approval. You will be able to login once an admin approves your request.
          </p>
          <Link
            href="/login"
            className="inline-block mt-2 text-sm font-semibold text-indigo-600 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur">
        <h1 className="text-2xl font-bold text-slate-900">Create a family account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Register and wait for admin approval to access the dashboard.
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Full Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="e.g. Ajay Sharma"
            />
          </label>

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
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
