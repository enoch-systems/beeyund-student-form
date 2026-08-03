import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "beeyuund - Full Stack Development Academy",
  description: "Join beeyuund's 2-month full stack development cohort. Master React, Node.js, and build real-world projects. Start your journey today.",
  generator: "v0.app",
  icons: {
    icon: "https://res.cloudinary.com/deafv5ovi/image/upload/v1785750827/log_x2cgip.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${plusJakartaSans.className}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
