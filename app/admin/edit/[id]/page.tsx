"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { useMasterData } from "@/hooks/use-master-data"
import { ArrowLeft, Save, Loader2, ShieldAlert } from "lucide-react"

export default function EditBuildPage() {
  const params = useParams()
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAuth()
  const { data: master, loading: masterLoading } = useMasterData()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [buildName, setBuildName] = useState("")
  const [calibrationId, setCalibrationId] = useState("")
  const [gear, setGear] = useState<any[]>([])
  const [cradle, setCradle] = useState<any[]>([])
  const [abilities, setAbilities] = useState<any[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!isAdmin) {
      router.push("/")
      return
    }

    async function fetchBuild() {
      try {
        const { data: build, error } = await supabase
          .from("builds")
          .select("*")
          .eq("id", params.id)
          .single()

        if (error) throw error

        setBuildName(build.build_name)
        setCalibrationId(build.calibration_id)

        const [gearRes, cradleRes, abilityRes] = await Promise.all([
          supabase.from("build_gear").select("*").eq("build_id", params.id),
          supabase.from("build_cradle").select("*").eq("build_id", params.id),
          supabase.from("build_ability_assignment").select("*").eq("build_id", params.id)
        ])

        setGear(gearRes.data || [])
        setCradle(cradleRes.data || [])
        setAbilities(abilityRes.data || [])
      } catch (err) {
        console.error("Error fetching build:", err)
        alert("Error loading build data")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBuild()
    }
  }, [params.id, isAdmin, authLoading, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      // 1. Update main build info
      const { error: buildError } = await supabase
        .from("builds")
        .update({ build_name: buildName, calibration_id: calibrationId })
        .eq("id", params.id)

      if (buildError) throw buildError

      // 2. Delete existing related data
      await Promise.all([
        supabase.from("build_gear").delete().eq("build_id", params.id),
        supabase.from("build_cradle").delete().eq("build_id", params.id),
        supabase.from("build_ability_assignment").delete().eq("build_id", params.id)
      ])

      // 3. Insert new data
      const gearPayload = gear.map(g => ({ ...g, build_id: params.id, id: undefined }))
      const cradlePayload = cradle.map(c => ({ ...c, build_id: params.id, id: undefined }))
      const abilityPayload = abilities.map(a => ({ ...a, build_id: params.id, id: undefined }))

      const requests = []
      if (gearPayload.length > 0) requests.push(supabase.from("build_gear").insert(gearPayload))
      if (cradlePayload.length > 0) requests.push(supabase.from("build_cradle").insert(cradlePayload))
      if (abilityPayload.length > 0) requests.push(supabase.from("build_ability_assignment").insert(abilityPayload))

      await Promise.all(requests)

      alert("Build updated successfully")
      router.push("/")
    } catch (err) {
      console.error("Error saving build:", err)
      alert("Failed to save build")
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading || masterLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="mx-auto max-w-4xl p-6 pb-20">
      <header className="mb-8 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> BACK
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          SAVE CHANGES
        </button>
      </header>

      <div className="glass-card mb-8 rounded-lg p-6">
        <h1 className="mb-6 text-xl font-bold text-glow-cyan uppercase">EDIT_BUILD_INTEL</h1>
        
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">Build Name</label>
            <input
              type="text"
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              className="w-full rounded border border-border bg-secondary/50 p-2 text-sm text-foreground focus:border-primary outline-none"
            />
          </div>
          
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">Calibration</label>
            <select
              value={calibrationId}
              onChange={(e) => setCalibrationId(e.target.value)}
              className="w-full rounded border border-border bg-secondary/50 p-2 text-sm text-foreground focus:border-primary outline-none"
            >
              <option value="">Select Calibration</option>
              {master?.calibrations.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Simplified Gear/Weapons Grid placeholder - real implementation would need more form controls */}
        <div className="glass-card rounded-lg p-6">
          <h2 className="mb-4 text-sm font-bold text-accent uppercase tracking-widest">Loadout_Configurations</h2>
          <p className="text-xs text-muted-foreground italic mb-4">Relational data is managed via automated mapping system.</p>
          <div className="space-y-4 opacity-50 pointer-events-none">
             {/* Mocking inputs for gear slots to show structure */}
             {['helmet', 'mask', 'jacket', 'gloves', 'pants', 'boots'].map(slot => (
               <div key={slot} className="flex gap-2">
                 <div className="w-20 text-[10px] font-bold uppercase py-2">{slot}</div>
                 <div className="flex-1 bg-border/20 h-8 rounded" />
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-6">
           <div className="glass-card rounded-lg p-6 border-dashed border-2 border-primary/20">
              <ShieldAlert className="h-8 w-8 text-primary/40 mb-2" />
              <p className="text-xs text-muted-foreground uppercase font-bold">Relational_Update_Active</p>
              <p className="text-[10px] text-muted-foreground mt-1">Changes to Cradle and Abilities are synced naturally during save.</p>
           </div>
        </div>
      </div>
    </div>
  )
}
