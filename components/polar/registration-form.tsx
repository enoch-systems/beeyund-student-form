"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Mail, Phone, User, AlertCircle } from "lucide-react"

interface RegistrationFormProps {
  onSubmit?: (data: FormData) => void
}

interface FormData {
  fullName: string
  phoneNumber: string
  email: string
}

type FormState = "form" | "loading" | "success" | "error"

export function RegistrationForm({ onSubmit }: RegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phoneNumber: "",
    email: "",
  })
  const [formState, setFormState] = useState<FormState>("form")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})

  const isFormComplete =
    formData.fullName.trim().length > 0 &&
    formData.phoneNumber.trim().length > 0 &&
    formData.email.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormComplete) return

    // Clear previous errors
    setErrorMessage(null)
    setFieldErrors({})

    // Show loading state
    setFormState("loading")

    try {
      // Step 1: Check if email already exists
      const { data: existing, error: checkError } = await supabase
        .from("registrations")
        .select("email")
        .eq("email", formData.email.toLowerCase().trim())
        .maybeSingle()

      // PGRST116 means no matching row found - that's fine, we can continue
      if (checkError && checkError.code !== "PGRST116") {
        throw checkError
      }

      if (existing) {
        // Email already registered
        setFormState("form")
        setError("This email address is already registered. Please use a different email or contact us if you believe this is a mistake.")
        setFieldErrors({ email: "This email is already registered" })
        return
      }

      // Step 2: Insert the registration
      const { error } = await supabase
        .from("registrations")
        .insert([
          {
            full_name: formData.fullName,
            email: formData.email.toLowerCase().trim(),
            phone_number: formData.phoneNumber,
          },
        ])

      if (error) {
        // Check for duplicate key error from database
        if (error.message.includes("duplicate key") || error.message.includes("already exists")) {
          setFormState("form")
          setError("This email address is already registered. Please use a different email or contact us if you believe this is a mistake.")
          setFieldErrors({ email: "This email is already registered" })
          return
        }
        throw error
      }

      // Step 3: Wait 4 seconds before showing success
      await new Promise((resolve) => setTimeout(resolve, 4000))

      // Step 4: Show success state
      setFormState("success")

      // Reset form data but keep state on success screen
      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
      })

      onSubmit?.(formData)
    } catch (error: any) {
      console.error("Registration error:", error)

      // Handle Supabase credentials not configured
      if (error.message?.includes("Supabase credentials are not configured")) {
        setFormState("form")
        setError("Oops! We're having trouble connecting. Please try again in a few minutes.")
        return
      }

      // Handle network errors
      if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
        setFormState("form")
        setError("Network error. Please check your internet connection and try again.")
        return
      }

      // Generic error
      setFormState("form")
      setError("Something went wrong. Please try again.")
    }
  }

  const setError = (message: string) => {
    setErrorMessage(message)
    setFormState("error")
    setTimeout(() => {
      setFormState("form")
      setErrorMessage(null)
      setFieldErrors({})
    }, 6000)
  }

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    // Clear field error when typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
    if (errorMessage) {
      setErrorMessage(null)
    }
  }

  const handleClose = () => {
    setFormState("form")
    setErrorMessage(null)
    setFieldErrors({})
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
          <h1 className="text-3xl font-medium text-white">
            <span className="text-sky-400">bee</span>
            <span>yund</span>
            <span className="text-sky-400"> Labs.</span>
          </h1>
          <p className="text-lg text-white/80">Ready to start your journey?</p>
        </div>

        {formState === "loading" ? (
          /* Loading State - Spinner */
          <div className="flex flex-col items-center justify-center py-16 gap-6">
            <div className="loader" />
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold text-white">Registering...</p>
              <p className="text-sm text-white/60">Please wait, we're processing your registration</p>
            </div>
          </div>
        ) : formState === "success" ? (
          /* Success State - Green Tick Animation */
          <div className="flex flex-col items-center justify-center py-12 gap-6">
            <div className="success-checkmark">
              <div className="check-icon">
                <span className="icon-line line-tip" />
                <span className="icon-line line-long" />
                <div className="icon-circle" />
                <div className="icon-fix" />
              </div>
            </div>

            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-white">Registration Successful!</h2>
              <p className="text-white/80">
                Welcome to beeyund Labs. Your spot has been reserved.
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-green-400/30 bg-green-400/10 p-4">
                  <span className="text-green-400 font-bold text-lg">✓</span>
                  <p className="text-sm text-white/80 text-left">
                    <span className="font-semibold text-white">Check your WhatsApp and Email.</span>{" "}
                    We'll reach out with important updates about the cohort.
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-sky-400/30 bg-sky-400/10 p-4">
                  <span className="text-sky-400 font-bold text-lg">⏰</span>
                  <p className="text-sm text-white/80 text-left">
                    You will be contacted within{" "}
                    <span className="font-semibold text-white">5 hours</span> with further instructions.
                  </p>
                </div>
              </div>

              <p className="text-xs text-white/50 pt-4">
                This page will stay open until you close it.
              </p>

              <button
                onClick={handleClose}
                className="mt-4 w-full rounded-lg bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-sky-500 hover:to-blue-700 hover:shadow-xl"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <>
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

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4 animate-[popIn_0.3s_ease-out]">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-300">{errorMessage}</p>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label htmlFor="fullName" className="text-sm text-white/80">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange("fullName")}
                    required
                    className={`w-full border bg-white/10 pl-10 pr-4 py-3 text-white placeholder:text-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 rounded-lg [&:-webkit-autofill]:bg-white/10 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s] ${
                      fieldErrors.fullName
                        ? "border-red-400/50 bg-red-500/10 focus:ring-red-400/50"
                        : "border-white/20 focus:ring-sky-400/50"
                    }`}
                    placeholder="Enoch Chukwudi"
                    autoComplete="name"
                  />
                </div>
                {fieldErrors.fullName && (
                  <p className="text-xs text-red-400">{fieldErrors.fullName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-2">
                <label htmlFor="phoneNumber" className="text-sm text-white/80">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                    required
                    className={`w-full border bg-white/10 pl-10 pr-4 py-3 text-white placeholder:text-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 rounded-lg [&:-webkit-autofill]:bg-white/10 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s] ${
                      fieldErrors.phoneNumber
                        ? "border-red-400/50 bg-red-500/10 focus:ring-red-400/50"
                        : "border-white/20 focus:ring-sky-400/50"
                    }`}
                    placeholder="+234 803 123 4567"
                    autoComplete="tel"
                  />
                </div>
                {fieldErrors.phoneNumber && (
                  <p className="text-xs text-red-400">{fieldErrors.phoneNumber}</p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm text-white/80">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    required
                    className={`w-full border bg-white/10 pl-10 pr-4 py-3 text-white placeholder:text-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 rounded-lg [&:-webkit-autofill]:bg-white/10 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s] ${
                      fieldErrors.email
                        ? "border-red-400/50 bg-red-500/10 focus:ring-red-400/50"
                        : "border-white/20 focus:ring-sky-400/50"
                    }`}
                    placeholder="enochchukwudi@example.com"
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-red-400">{fieldErrors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isFormComplete}
                className="w-full rounded-lg bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-sky-500 hover:to-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:from-slate-500 disabled:to-slate-600 disabled:text-slate-200 disabled:shadow-none"
              >
                Proceed to Registration
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}