"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { db } from "@/firebase/config"
import { useAuth } from "@/context/AuthContext"
import {
  collection, addDoc, getDocs, updateDoc, doc, query, orderBy
} from "firebase/firestore"

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: unknown
  targetRole?: "admin" | "member" | "all"
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  addNotification: (title: string, message: string, targetRole?: "admin" | "member" | "all") => Promise<void>
  refresh: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [], unreadCount: 0,
  markRead: async () => {}, markAllRead: async () => {},
  addNotification: async () => {}, refresh: async () => {},
})

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, role } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  const refresh = useCallback(async () => {
    if (!user || !role) return
    try {
      const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"))
      const snap = await getDocs(q)
      const all = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Notification, "id">) }))
      setNotifications(all.filter(n => n.targetRole === "all" || n.targetRole === role))
    } catch (e) {
      console.error("Failed to load notifications", e)
    }
  }, [user, role])

  useEffect(() => { void refresh() }, [refresh])

  const markRead = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { read: true })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read)
    await Promise.all(unread.map(n => updateDoc(doc(db, "notifications", n.id), { read: true })))
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const addNotification = async (title: string, message: string, targetRole: "admin" | "member" | "all" = "all") => {
    // Save to Firestore (in-app)
    await addDoc(collection(db, "notifications"), {
      title, message, read: false, createdAt: new Date(), targetRole,
    })

    // Send FCM push to all users who have a token
    try {
      const usersSnap = await getDocs(collection(db, "users"))
      const tokens: string[] = []
      usersSnap.forEach(d => {
        const data = d.data()
        if (data.fcmToken && (targetRole === "all" || data.role === targetRole)) {
          tokens.push(data.fcmToken)
        }
      })

      // Call our API route to send via FCM
      if (tokens.length > 0) {
        await fetch("/api/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tokens, title, message }),
        })
      }
    } catch (e) {
      console.error("FCM push failed", e)
    }

    await refresh()
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, addNotification, refresh }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
