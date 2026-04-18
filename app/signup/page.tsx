"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { auth, db } from "@/firebase/config"
import {
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore"

export default function Signup() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleGoogleSignup = async () => {
    setError(null)
    setLoading(true)
    try {
      if (!referralCode.trim()) {
        setError("Referral code is required to join a family.")
        setLoading(false)
        return
      }

      // Verify referral code
      const familiesRef = collection(db, "families")
      const q = query(familiesRef, where("referralCode", "==", referralCode.trim()))
      const familySnapshot = await getDocs(q)

      if (familySnapshot.empty) {
        setError("Invalid referral code. Please check and try again.")
        setLoading(false)
        return
      }

      const familyDoc = familySnapshot.docs[0]
      const familyId = familyDoc.id

      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      const cred = await signInWithPopup(auth, provider)

      const userDocRef = doc(db, "users", cred.user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        await signOut(auth)
        router.push("/login")
        return
      }

      await setDoc(userDocRef, {
        name: cred.user.displayName ?? "",
        email: cred.user.email,
        familyId: familyId,
        role: "member",
        status: "pending",
        createdAt: new Date(),
      })

      await signOut(auth)
      setSuccess(true)
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") return
      setError(e.message ?? "Google sign-up failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    setError(null)
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all fields.")
      return
    }
    if (!referralCode.trim()) {
      setError("Referral code is required to join a family.")
      return
    }
    setLoading(true)
    try {
      // Verify referral code
      const familiesRef = collection(db, "families")
      const q = query(familiesRef, where("referralCode", "==", referralCode.trim()))
      const familySnapshot = await getDocs(q)

      if (familySnapshot.empty) {
        setError("Invalid referral code. Please check and try again.")
        setLoading(false)
        return
      }

      const familyDoc = familySnapshot.docs[0]
      const familyId = familyDoc.id

      const cred = await createUserWithEmailAndPassword(auth, email, password)

      await setDoc(doc(db, "users", cred.user.uid), {
        name: name.trim(),
        email: cred.user.email,
        familyId: familyId,
        role: "member",
        status: "pending",
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
            <span className="text-sm font-medium text-slate-700">Referral Code</span>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Enter family referral code"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Ask your family admin for the referral code
            </p>
          </label>

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

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
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
          Sign up with Google
        </button>

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
