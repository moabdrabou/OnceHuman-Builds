"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldAlert, Trash2, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface BuildOption {
  id: string
  build_name: string
}

export default function AdminDeletePage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()

  const [builds, setBuilds] = useState<BuildOption[]>([])
  const [selectedBuildId, setSelectedBuildId] = useState("")
  const [fetchingBuilds, setFetchingBuilds] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      alert("⚠️ Access Denied\n\nYou do not have permission to access this page.")
      router.push("/")
    }
  }, [isAdmin, authLoading, router])

  const fetchBuilds = async () => {
    setFetchingBuilds(true)
    try {
      const { data, error } = await supabase
        .from("builds")
        .select("id, build_name")
        .order("build_name")
      
      if (error) throw error
      setBuilds(data || [])
    } catch (err) {
      console.error("Error fetching builds:", err)
    } finally {
      setFetchingBuilds(false)
    }
  }

  useEffect(() => {
    if (isAdmin) fetchBuilds()
  }, [isAdmin])

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBuildId || isDeleting) return

    const build = builds.find(b => b.id === selectedBuildId)
    const confirmed = window.confirm(
      `CRITICAL WARNING: PROCEED WITH SYSTEM PURGE?\n\nTarget Asset: ${build?.build_name || 'UNKNOWN'}\n\nThis will permanently destroy the build and all its sub-systems. This action cannot be undone.`
    )

    if (!confirmed) return

    setIsDeleting(true)
    try {
      console.log(`PURGE_INITIATED: Target=${selectedBuildId}`)

      // 1. Delete associated data first (relational safety)
      const { error: abilityError } = await supabase
        .from("build_ability_assignment")
        .delete()
        .eq("build_id", selectedBuildId)
      if (abilityError) throw abilityError

      const { error: cradleError } = await supabase
        .from("build_cradle")
        .delete()
        .eq("build_id", selectedBuildId)
      if (cradleError) throw cradleError

      const { error: gearError } = await supabase
        .from("build_gear")
        .delete()
        .eq("build_id", selectedBuildId)
      if (gearError) throw gearError

      // 2. Finally delete the build core
      const { error: buildError } = await supabase
        .from("builds")
        .delete()
        .eq("id", selectedBuildId)
      if (buildError) throw buildError

      alert("⚡ PURGE SUCCESSFUL: Tactical asset has been neutralized.")
      setSelectedBuildId("")
      fetchBuilds()
    } catch (err: any) {
      console.error("Purge Error:", err)
      alert(`❌ CRITICAL FAILURE: Purge sequence interrupted. ${err.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="mx-auto max-w-4xl p-6 pb-20 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-900/30 pb-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold text-glow-red uppercase tracking-tight text-red-500">Purge Build Protocol</h1>
            <p className="text-[10px] tracking-widest text-red-400 uppercase font-bold">Administrative Destructive Action Layer</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          [ CANCEL_RETURN ]
        </button>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-xl bg-[#0c0f1a] border border-red-900/20 rounded-lg p-10 shadow-2xl shadow-red-900/10 relative overflow-hidden group">
          {/* Decorative scanner line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-20 group-hover:animate-scan" />
          
          <div className="text-center mb-8 space-y-3">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="text-sm tracking-[0.4em] text-red-400 font-bold uppercase">System_Purge_Initialization</h2>
            <p className="text-[10px] text-red-300/60 font-mono italic">Ensure target identification is verified before proceeding.</p>
          </div>

          <form onSubmit={handleDelete} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest text-red-500 uppercase font-bold font-mono">Select Build To Purge</label>
              <div className="relative">
                <select
                  disabled={fetchingBuilds || isDeleting}
                  value={selectedBuildId}
                  onChange={(e) => setSelectedBuildId(e.target.value)}
                  className="w-full bg-[#05070a] border border-red-900/30 rounded px-4 py-3 text-sm text-red-400 font-mono focus:border-red-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>-- SELECT NEURAL LINK TO PURGE --</option>
                  {builds.map((build) => (
                    <option key={build.id} value={build.id}>
                      {build.build_name.toUpperCase()}
                    </option>
                  ))}
                </select>
                {fetchingBuilds && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={!selectedBuildId || isDeleting}
                className={`w-full group relative flex items-center justify-center gap-3 py-4 rounded font-bold tracking-[0.3em] uppercase transition-all duration-300 ${
                  !selectedBuildId || isDeleting
                    ? "bg-red-900/10 text-red-900/40 border border-red-900/10 cursor-not-allowed"
                    : "bg-red-950/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white shadow-lg shadow-red-900/20 active:scale-95"
                }`}
              >
                {isDeleting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
                {isDeleting ? "PURGING_SYSTEMS..." : "INITIALIZE PURGE"}
                
                {selectedBuildId && !isDeleting && (
                  <div className="absolute inset-0 bg-red-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
              
              <p className="text-[9px] tracking-widest text-red-500/60 uppercase font-mono">
                Access Level: Admin // Security Protocol: Active
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
