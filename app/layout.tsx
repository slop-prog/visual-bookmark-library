import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toast"

export const metadata: Metadata = {
  title: "Marks — Visual Bookmark Library",
  description: "A minimal, visual bookmark manager",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased" style={{background:'#0a0a0a',color:'#ededed',fontFamily:"'DM Sans', -apple-system, sans-serif"}}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
