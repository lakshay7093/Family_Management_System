import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import ThemeProvider from "@/components/ThemeProvider"
import { Toaster } from "react-hot-toast"

export const metadata: Metadata = {
  title: "Family Dashboard",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>
            <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}