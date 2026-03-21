"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { auth, db } from "@/firebase/config"
import {
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { doc, getDoc, setDoc, collection, getCountFromServer } from "firebase/firestore"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)

  const handleGoogleSignIn = async () => {
    setError(null)
    setPending(false)
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      const cred = await signInWithPopup(auth, provider)

      const userDocRef = doc(db, "users", cred.user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        const usersCount = await getCountFromServer(collection(db, "users"))
        const isFirstUser = usersCount.data().count === 0

        await setDoc(userDocRef, {
          name: cred.user.displayName ?? "",
          email: cred.user.email,
          role: isFirstUser ? "admin" : "member",
          status: isFirstUser ? "approved" : "pending",
          createdAt: new Date(),
        })

        if (!isFirstUser) {
          await signOut(auth)
          setPending(true)
          return
        }
      } else {
        const status = userDoc.data()?.status ?? "approved"
        if (status === "pending") {
          await signOut(auth)
          setPending(true)
          return
        }
        if (status === "rejected") {
          await signOut(auth)
          setError("Your registration has been rejected by the admin.")
          return
        }
      }

      router.push("/dashboard")
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") return
      setError(e.message ?? "Google sign-in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

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
      const userDoc = await getDoc(doc(db, "users", cred.user.uid))
      const status = userDoc.data()?.status ?? "approved"

      if (status === "pending") {
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

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-4 w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continue with Google
        </button>

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
