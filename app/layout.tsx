import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import ThemeProvider from "@/components/ThemeProvider"
import { Toaster } from "react-hot-toast"

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