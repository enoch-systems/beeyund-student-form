"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, LogIn, AlertCircle, Shield } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingCredentials, setPendingCredentials] = useState<{email: string, password: string} | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push("/dashboard")
      }
    }
    checkUser()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // Clear any previous errors
    
    // Show confirmation dialog
    setPendingCredentials({ email, password })
    setShowConfirmDialog(true)
  }

  const confirmLogin = async () => {
    if (!pendingCredentials) return
    
    setLoading(true)
    setShowConfirmDialog(false)

    try {
      // First, attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: pendingCredentials.email,
        password: pendingCredentials.password,
      })

      if (error) {
        // Handle specific error cases with user-friendly messages
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please confirm your email address before logging in. Check your inbox for the confirmation link.")
        } else if (error.message.includes("Too many requests")) {
          setError("Too many login attempts. Please wait a moment and try again.")
        } else if (error.message.includes("User not found")) {
          setError("No account found with this email address. Please contact your administrator.")
        } else {
          setError(error.message || "Login failed. Please try again.")
        }
        throw error
      }

      if (data.user) {
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()

        if (profileError || !profile) {
          // Profile doesn't exist - user might be a student who shouldn't access admin
          await supabase.auth.signOut()
          setError("Access denied. Your account is not authorized for admin access. Only administrators can login here.")
          return
        }

        if (profile.role !== "admin") {
          // User exists but is not an admin
          await supabase.auth.signOut()
          setError("Access denied. You don't have admin privileges. This portal is for administrators only.")
          return
        }

        // User is admin, proceed
        toast.success("Welcome back! Redirecting to dashboard...")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error: any) {
      // Error already handled above
      console.error("Login error:", error)
    } finally {
      setLoading(false)
      setPendingCredentials(null)
    }
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8"
      style={{
        backgroundColor: "#050b17",
        backgroundImage:
          "linear-gradient(rgba(2, 6, 23, 0.6), rgba(2, 6, 23, 0.75)), url('https://res.cloudinary.com/deafv5ovi/image/upload/q_auto,f_auto,w_1600,c_fill/v1785750399/gaha_qew9qi.jpg')",
      }}
    >
      {/* Gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="relative z-10 w-full max-w-md animate-[popIn_0.7s_ease-out_forwards]">
        {/* Logo and Header */}
        <div className="flex flex-col gap-6 items-center text-center mb-8">
          <div className="flex items-center justify-center">
            <img
              src="https://res.cloudinary.com/deafv5ovi/image/upload/v1785750827/log_x2cgip.png"
              alt="beeyund Labs logo"
              className="h-16 w-16 object-contain"
            />
          </div>
          <div>
            <h1 className="text-4xl font-medium text-white mb-2">
              <span className="text-sky-400">bee</span>
              <span>yund</span>
              <span className="text-sky-400"> Labs.</span>
            </h1>
            <p className="text-lg text-white/80">Admin Portal</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm text-white/80">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 z-10" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-white/20 bg-white/5 pl-10 pr-4 py-3 text-white placeholder:text-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50 rounded-lg [&:-webkit-autofill]:bg-white/5 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]"
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm text-white/80">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 z-10" size={18} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null) // Clear error when user types
                  }}
                  required
                  className={`w-full border pl-10 pr-12 py-3 text-white placeholder:text-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 rounded-lg [&:-webkit-autofill]:bg-white/5 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s] ${
                    error 
                      ? "bg-red-500/10 border-red-400/50 focus:ring-red-400/50" 
                      : "bg-white/5 border-white/20 focus:ring-sky-400/50"
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors z-10"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 mt-1 animate-[popIn_0.3s_ease-out]">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-xs text-red-400 leading-tight">{error}</p>
                </div>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full rounded-lg bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-sky-500 hover:to-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:from-slate-500 disabled:to-slate-600 disabled:text-slate-200 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 rounded-lg bg-sky-500/10 border border-sky-400/20">
            <div className="flex gap-3">
              <AlertCircle className="text-sky-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-white/70">
                <p className="font-semibold text-white mb-1">Admin Access Only</p>
                <p>This portal is restricted to authorized administrators only. Unauthorized access attempts are logged.</p>
              </div>
            </div>
          </div>

          {/* Login Confirmation Dialog */}
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="text-sky-500" size={20} />
                  Confirm Login
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  You're about to login to the admin portal. Please verify your credentials:
                </p>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-1">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Email:</span> {email}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Password:</span> ••••••••
                  </p>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700">
                  <p className="text-xs text-sky-700 dark:text-sky-300">
                    ℹ️ This action will be logged for security purposes.
                  </p>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmDialog(false)
                    setPendingCredentials(null)
                  }}
                  disabled={loading}
                  className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmLogin}
                  disabled={loading}
                  className="bg-sky-500 text-white hover:bg-sky-600"
                >
                  {loading ? "Verifying..." : "Yes, Login"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-white/50">
              beeyund Labs Admin Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}