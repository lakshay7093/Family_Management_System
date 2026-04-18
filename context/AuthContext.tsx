"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { auth, db } from "@/firebase/config"
import { onAuthStateChanged, User } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"

export type UserRole = "admin" | "member"
export type UserStatus = "approved" | "pending" | "rejected"

interface AuthContextType {
  user: User | null
  role: UserRole | null
  status: UserStatus | null
  familyRole: string | null
  familyId: string | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  status: null,
  familyRole: null,
  familyId: null,
  loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [status, setStatus] = useState<UserStatus | null>(null)
  const [familyRole, setFamilyRole] = useState<string | null>(null)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            setRole((userDoc.data().role as UserRole) ?? "member")
            setStatus((userDoc.data().status as UserStatus) ?? "approved")
            setFamilyRole(userDoc.data().familyRole ?? null)
            setFamilyId(userDoc.data().familyId ?? null)
          } else {
            await setDoc(userDocRef, {
              email: currentUser.email,
              role: "member",
              status: "pending",
              createdAt: new Date(),
            })
            setRole("member")
            setStatus("pending")
            setFamilyRole(null)
          }
        } catch (err) {
          console.error("Failed to fetch user role", err)
          setRole("member")
          setStatus("approved")
        }
      } else {
        setRole(null)
        setStatus(null)
        setFamilyRole(null)
        setFamilyId(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, status, familyRole, familyId, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
