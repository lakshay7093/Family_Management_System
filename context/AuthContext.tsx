"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { auth, db } from "@/firebase/config"
import { onAuthStateChanged, User } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"

export type UserRole = "admin" | "member"

interface AuthContextType {
  user: User | null
  role: UserRole | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
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
          } else {
            // First time login — create user doc with default role "member"
            // First registered user gets admin (optional: remove this logic if you want manual assignment)
            await setDoc(userDocRef, {
              email: currentUser.email,
              role: "member",
              createdAt: new Date(),
            })
            setRole("member")
          }
        } catch (err) {
          console.error("Failed to fetch user role", err)
          setRole("member")
        }
      } else {
        setRole(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
