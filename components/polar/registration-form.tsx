"use client"

import { useState } from "react"

interface RegistrationFormProps {
  onSubmit?: (data: FormData) => void
}

interface FormData {
  fullName: string
  phoneNumber: string
  email: string
}

export function RegistrationForm({ onSubmit }: RegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phoneNumber: "",
    email: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div className="w-full max-w-xl animate-[popIn_0.7s_ease-out_forwards] rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md [transform-origin:center]">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-3 items-center text-center">
          <div className="flex items-center justify-center">
            <img
              src="https://res.cloudinary.com/deafv5ovi/image/upload/v1785750827/log_x2cgip.png"
              alt="beeyund Labs logo"
              className="h-12 w-12 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white"># beeyund Labs.</h1>
          <p className="text-lg text-white/80">Ready to start your journey?</p>
        </div>

        {/* Cohort Info */}
        <div className="rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white mb-2">2-Month Full Stack Development Cohort</h2>
          <p className="text-sm text-white/70 mb-3">
            Master frontend and backend development with hands-on projects
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-sky-400/20 text-sky-300 px-3 py-1 rounded-full text-xs font-medium">
              React & Next.js
            </span>
            <span className="bg-sky-400/20 text-sky-300 px-3 py-1 rounded-full text-xs font-medium">
              Node.js
            </span>
            <span className="bg-sky-400/20 text-sky-300 px-3 py-1 rounded-full text-xs font-medium">
              Database Design
            </span>
            <span className="bg-sky-400/20 text-sky-300 px-3 py-1 rounded-full text-xs font-medium">
              API Development
            </span>
          </div>
        </div>

        {/* Projects Preview */}
        <div className="rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-white mb-2">Projects You'll Build</h3>
          <ul className="space-y-1.5 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-sky-400 mt-0.5">▸</span>
              <span>E-commerce platform with payment integration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-400 mt-0.5">▸</span>
              <span>Real-time chat application with WebSockets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-400 mt-0.5">▸</span>
              <span>Social media dashboard with analytics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-400 mt-0.5">▸</span>
              <span>Task management system with team collaboration</span>
            </li>
          </ul>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="text-sm text-white/80">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange("fullName")}
              required
              className="w-full border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50 rounded-lg"
              placeholder="Enoch Chukwudi"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phoneNumber" className="text-sm text-white/80">
              WhatsApp Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange("phoneNumber")}
              required
              className="w-full border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50 rounded-lg"
              placeholder="+234 803 123 4567"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm text-white/80">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              required
              className="w-full border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50 rounded-lg"
              placeholder="enochchukwudi@example.com"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Proceed to Registration
          </button>
        </form>
      </div>
    </div>
  )
}