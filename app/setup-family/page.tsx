"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { createFamily } from "@/lib/familyUtils"

export default function SetupFamily() {
  const router = useRouter()
  const { user } = useAuth()
  const [familyName, setFamilyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      setError("Please enter a family name")
      return
    }

    if (!user) {
      setError("You must be logged in")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { referralCode } = await createFamily(user.uid, familyName.trim())
      
      // Show success with referral code
      alert(`Family created successfully!\n\nYour Referral Code: ${referralCode}\n\nShare this code with family members so they can join.`)
      router.push("/dashboard")
    } catch (err) {
      console.error("Error creating family:", err)
      setError("Failed to create family. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur">
        <h1 className="text-2xl font-bold text-slate-900">Setup Your Family</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create your family group and get a referral code to invite members.
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Family Name</span>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="e.g. Sharma Family"
            />
          </label>

          <button
            type="button"
            onClick={handleCreateFamily}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
          >
            {loading ? "Creating..." : "Create Family"}
          </button>
        </div>
      </div>
    </div>
  )
}
