"use client"

import { useState, useEffect } from "react"
import { supabase, getClient, Registration } from "@/lib/supabase"
import { Copy, Check, Search, SortAsc, SortDesc, Menu, X, LogOut, Moon, Sun, Users, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type SortField = "created_at" | "full_name"
type SortOrder = "asc" | "desc"

export default function DashboardPage() {
  const router = useRouter()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Registration | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const itemsPerPage = 12
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage)

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("admin-dark-mode")
    if (savedMode === "true") {
      setDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Fetch registrations and set up real-time subscription
  useEffect(() => {
    fetchRegistrations()

    // Use the actual client for realtime (Proxy can break `this` binding)
    const client = getClient()

    // Subscribe to real-time changes on the registrations table
    const channel = client
      .channel("registrations-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "registrations" },
        (payload) => {
          const newRegistration = payload.new as Registration
          setRegistrations((prev) => {
            // Check if already exists (prevent duplicates)
            if (prev.some((r) => r.id === newRegistration.id)) return prev
            // Add new registration at the top
            return [newRegistration, ...prev]
          })
          // Show toast notification
          toast.success(`${newRegistration.full_name} just registered!`)
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "registrations" },
        (payload) => {
          const deletedId = payload.old.id
          setRegistrations((prev) => prev.filter((r) => r.id !== deletedId))
        }
      )
      .subscribe()

    // Polling fallback - check for new registrations every 5 seconds
    // This guarantees updates even if realtime isn't working
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from("registrations")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50)

        if (error) throw error
        if (data) {
          setRegistrations((prev) => {
            // Merge new data with existing, avoiding duplicates
            const existingIds = new Set(prev.map((r) => r.id))
            const newOnes = data.filter((r) => !existingIds.has(r.id))
            if (newOnes.length > 0) {
              return [...newOnes, ...prev]
            }
            return prev
          })
        }
      } catch (error) {
        // Silent fail for polling
        console.error("Polling error:", error)
      }
    }, 5000)

    // Cleanup subscription and polling on unmount
    return () => {
      client.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [])

  // Apply search and sort
  useEffect(() => {
    let result = [...registrations]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (reg) =>
          reg.full_name.toLowerCase().includes(query) ||
          reg.email.toLowerCase().includes(query) ||
          reg.phone_number.includes(query)
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      if (sortField === "created_at") {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortField === "full_name") {
        comparison = a.full_name.localeCompare(b.full_name)
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredRegistrations(result)
    setCurrentPage(1)
  }, [searchQuery, sortField, sortOrder, registrations])

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setRegistrations(data || [])
    } catch (error) {
      console.error("Error fetching registrations:", error)
      toast.error("Failed to load registrations")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast.success("Copied to clipboard!")
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error("Failed to copy")
    }
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem("admin-dark-mode", newMode.toString())
    if (newMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success("Logged out successfully")
      setShowLogoutDialog(false)
      router.push("/login")
    } catch (error) {
      toast.error("Failed to logout")
      setShowLogoutDialog(false)
    }
  }

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from("registrations")
        .delete()
        .eq("id", studentToDelete.id)

      if (error) throw error

      // Remove from local state
      setRegistrations((prev) => prev.filter((r) => r.id !== studentToDelete.id))
      toast.success(`${studentToDelete.full_name} has been removed`)
      setStudentToDelete(null)
    } catch (error) {
      console.error("Error deleting student:", error)
      toast.error("Failed to delete student. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 3

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= maxVisible; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 1) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage; i <= currentPage; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  const currentRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center gap-2">
          <img
            src="https://res.cloudinary.com/deafv5ovi/image/upload/v1785750827/log_x2cgip.png"
            alt="beeyund Labs"
            className="h-8 w-8 object-contain"
          />
          <span className="font-semibold text-slate-900 dark:text-white">
            <span className="text-sky-500">bee</span>yund
          </span>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <img
                src="https://res.cloudinary.com/deafv5ovi/image/upload/v1785750827/log_x2cgip.png"
                alt="beeyund Labs"
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  <span className="text-sky-500">bee</span>yund
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Admin Dashboard</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-lg font-medium"
              >
                <Users size={20} />
                <span>Registrations</span>
              </a>
            </nav>

            {/* Bottom Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-700 dark:text-slate-300"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
              </button>

              <button
                onClick={() => setShowLogoutDialog(true)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Logout Confirmation Dialog */}
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">
                Confirm Logout
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-600 dark:text-slate-400">
                Are you sure you want to logout? You'll need to enter your credentials again to access the admin dashboard.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowLogoutDialog(false)}
                className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Yes, Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Student Confirmation Dialog */}
        <Dialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
          <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <Trash2 className="text-red-500" size={20} />
                Delete Student
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {studentToDelete?.full_name}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-1">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Email:</span> {studentToDelete?.email}
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Phone:</span> {studentToDelete?.phone_number}
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setStudentToDelete(null)}
                disabled={isDeleting}
                className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteStudent}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Student Registrations
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Manage and view all student registrations
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Registrations</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {registrations.length}
                    </p>
                  </div>
                  <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                    <Users className="text-sky-600 dark:text-sky-400" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Last 24 Hours</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {
                        registrations.filter((r) => {
                          const dayAgo = new Date()
                          dayAgo.setDate(dayAgo.getDate() - 1)
                          return new Date(r.created_at) > dayAgo
                        }).length
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Users className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Showing</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {filteredRegistrations.length}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Users className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Sort Controls */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Sort Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleSort("created_at")}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
                      ${
                        sortField === "created_at"
                          ? "bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-700 text-sky-700 dark:text-sky-300"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }
                    `}
                  >
                    {sortOrder === "asc" ? <SortAsc size={18} /> : <SortDesc size={18} />}
                    <span className="hidden sm:inline">Date</span>
                  </button>

                  <button
                    onClick={() => toggleSort("full_name")}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
                      ${
                        sortField === "full_name"
                          ? "bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-700 text-sky-700 dark:text-sky-300"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }
                    `}
                  >
                    {sortOrder === "asc" ? <SortAsc size={18} /> : <SortDesc size={18} />}
                    <span className="hidden sm:inline">Name</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-slate-600 dark:text-slate-400">
                  Loading registrations...
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="p-8 text-center text-slate-600 dark:text-slate-400">
                  {searchQuery ? "No registrations found matching your search" : "No registrations yet"}
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Full Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Registered
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {currentRegistrations.map((reg, index) => (
                          <tr
                            key={reg.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                              #{registrations.length - (currentPage - 1) * itemsPerPage - index}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                              {reg.full_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-2">
                                <span className="truncate max-w-xs">{reg.email}</span>
                                <button
                                  onClick={() => copyToClipboard(reg.email, reg.id)}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                                  title="Copy email"
                                >
                                  {copiedId === reg.id ? (
                                    <Check size={16} className="text-green-600" />
                                  ) : (
                                    <Copy size={16} className="text-slate-400" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-2">
                                <span>{reg.phone_number}</span>
                                <button
                                  onClick={() => copyToClipboard(reg.phone_number, reg.id)}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                                  title="Copy phone"
                                >
                                  {copiedId === reg.id ? (
                                    <Check size={16} className="text-green-600" />
                                  ) : (
                                    <Copy size={16} className="text-slate-400" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                              {new Date(reg.created_at).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => setStudentToDelete(reg)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete student"
                              >
                                <Trash2 size={16} className="text-slate-400 hover:text-red-500 transition-colors" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
                    {currentRegistrations.map((reg, index) => (
                      <div key={reg.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                              {reg.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                #{registrations.length - (currentPage - 1) * itemsPerPage - index}
                              </p>
                              <p className="text-sm text-slate-900 dark:text-white font-medium">
                                {reg.full_name}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 ml-13">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Email:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                                {reg.email}
                              </span>
                              <button
                                onClick={() => copyToClipboard(reg.email, reg.id)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                              >
                                {copiedId === reg.id ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Copy size={14} className="text-slate-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Phone:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-600 dark:text-slate-300">
                                {reg.phone_number}
                              </span>
                              <button
                                onClick={() => copyToClipboard(reg.phone_number, reg.id)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                              >
                                {copiedId === reg.id ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Copy size={14} className="text-slate-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Registered:</span>
                            <span className="text-xs text-slate-600 dark:text-slate-300">
                              {new Date(reg.created_at).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              onClick={() => setStudentToDelete(reg)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-slate-600 dark:text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {getPageNumbers().map((page, idx) => (
                        <button
                          key={idx}
                          onClick={() => typeof page === "number" && setCurrentPage(page)}
                          disabled={page === "..."}
                          className={`
                            min-w-[40px] h-10 rounded-lg font-medium transition-colors
                            ${
                              page === currentPage
                                ? "bg-sky-500 text-white"
                                : page === "..."
                                  ? "cursor-default text-slate-400"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }
                          `}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-slate-600 dark:text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}