"use client"

import { useEffect } from "react"
import { getToken } from "firebase/messaging"
import { doc, setDoc } from "firebase/firestore"
import { getFirebaseMessaging } from "@/firebase/config"
import { db } from "@/firebase/config"
import { useAuth } from "@/context/AuthContext"

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

// Firebase config to send to service worker (NEXT_PUBLIC_ vars are fine in client bundle)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

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

        // Don't block if notifications not supported or permission denied
        if (!("Notification" in window)) return
        
        const permission = await Notification.requestPermission()
        if (permission !== "granted") return

        // Register SW
        let swReg: ServiceWorkerRegistration
        try {
          swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" })
          await navigator.serviceWorker.ready
        } catch {
          // SW registration failed (common on localhost) — skip silently
          return
        }

        // Send config to SW via postMessage (no hardcoded keys in SW file)
        swReg.active?.postMessage({ type: "INIT_FIREBASE", config: firebaseConfig })

        let token: string | null = null
        try {
          token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: swReg,
          })
        } catch {
          // Push service error (common on localhost/HTTP) — skip silently
          return
        }

        if (!token) return

        await setDoc(
          doc(db, "users", user.uid),
          { fcmToken: token, fcmUpdatedAt: new Date() },
          { merge: true }
        )
      } catch (err) {
        // Never block the app for push notification failures
        console.warn("Push notification setup skipped:", err)
      }
    }

    void register()
  }, [user])
}
