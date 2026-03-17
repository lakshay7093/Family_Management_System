"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function AdminOnly({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && role !== "admin") {
      router.replace("/dashboard/documents")
    }
  }, [role, loading, router])

  if (loading) return null
  if (role !== "admin") return null

  return <>{children}</>
}
