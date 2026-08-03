"use client"

import { BrandBadge } from "@/components/polar/brand-badge"
import { RegistrationForm } from "@/components/polar/registration-form"
import { FooterLinks } from "@/components/polar/footer-links"

export default function BeyondAcademyLandingPage() {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-between bg-cover bg-center bg-no-repeat px-4 py-8"
      style={{
        backgroundColor: "#050b17",
        backgroundImage:
          "linear-gradient(rgba(2, 6, 23, 0.6), rgba(2, 6, 23, 0.75)), url('https://res.cloudinary.com/deafv5ovi/image/upload/q_auto,f_auto,w_1600,c_fill/v1785750399/gaha_qew9qi.jpg')",
      }}
    >
      {/* Gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="relative z-10 flex w-full flex-col items-center">
        <RegistrationForm />
      </div>

      <div className="relative z-10 pb-4 mt-5 md:mt-0">
        <FooterLinks />
      </div>
    </main>
  )
}
