"use client"

import { useEffect } from "react"
import { getToken } from "firebase/messaging"
import { doc, setDoc } from "firebase/firestore"
import { getFirebaseMessaging } from "@/firebase/config"
import { db } from "@/firebase/config"
import { useAuth } from "@/context/AuthContext"

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

export function usePushNotifications() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !VAPID_KEY) return
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator) || !("Notification" in window)) return

    const register = async () => {
      try {
        const messaging = await getFirebaseMessaging()
        if (!messaging) return

        const permission = await Notification.requestPermission()
        if (permission !== "granted") {
          console.log("Notification permission denied")
          return
        }

        // Explicitly register the service worker first
        const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          scope: "/",
        })

        // Wait for SW to be active
        await navigator.serviceWorker.ready

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg,
        })

        if (!token) {
          console.warn("No FCM token received")
          return
        }

        await setDoc(
          doc(db, "users", user.uid),
          { fcmToken: token, fcmUpdatedAt: new Date() },
          { merge: true }
        )

        console.log("FCM token saved:", token.slice(0, 20) + "...")
      } catch (err) {
        console.error("Push notification setup failed:", err)
      }
    }

    void register()
  }, [user])
}
