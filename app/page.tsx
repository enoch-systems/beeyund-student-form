"use client"

import { BrandBadge } from "@/components/polar/brand-badge"
import { RegistrationForm } from "@/components/polar/registration-form"
import { FooterLinks } from "@/components/polar/footer-links"

export default function BeyondAcademyLandingPage() {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-between bg-cover bg-center bg-no-repeat px-4 py-8"
      style={{
        backgroundImage: "url('/images/background.png')",
      }}
    >
      {/* Gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center pt-8">
        <BrandBadge />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center">
        <RegistrationForm />
      </div>

      <div className="relative z-10 pb-4">
        <FooterLinks />
      </div>
    </main>
  )
}
