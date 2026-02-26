"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldAlert, Plus, Save, Activity, Shield, Sword, Crosshair, Sparkles, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface MasterData {
  calibrations: any[]
  cradleItems: any[]
  abilities: any[]
  gearSets: any[]
  hides: any[]
  mods: any[]
  weapons: any[]
}

export default function AdminAddPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()

  const [masterData, setMasterData] = useState<MasterData | null>(null)
  const [fetchingData, setFetchingData] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form State
  const [buildName, setBuildName] = useState("")
  const [calibrationId, setCalibrationId] = useState("")
  
  const [weapon1, setWeapon1] = useState({ id: "", modId: "" })
  const [weapon2, setWeapon2] = useState({ id: "", modId: "" })
  const [melee, setMelee] = useState({ id: "", modId: "" })

  const [gear, setGear] = useState<Record<string, { id: string, hideId: string, modId: string }>>({
    helmet: { id: "", hideId: "", modId: "" },
    mask: { id: "", hideId: "", modId: "" },
    jacket: { id: "", hideId: "", modId: "" },
    gloves: { id: "", hideId: "", modId: "" },
    pants: { id: "", hideId: "", modId: "" },
    boots: { id: "", hideId: "", modId: "" },
  })

  const [cradle, setCradle] = useState<string[]>(Array(8).fill(""))
  const [abilities, setAbilities] = useState<string[]>(Array(3).fill(""))

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      alert("⚠️ Access Denied\n\nYou do not have permission to access this page.")
      router.push("/")
    }
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    if (!isAdmin) return

    async function fetchMasterLists() {
      setFetchingData(true)
      try {
        const [
          calibRes,
          cradleRes,
          abilityRes,
          gearRes,
          hideRes,
          modRes,
          weaponRes
        ] = await Promise.all([
          supabase.from("calibration").select("id, name").order("name"),
          supabase.from("cradle_master_list").select("id, item_name").order("item_name"),
          supabase.from("ability_master_list").select("id, ability_name").order("ability_name"),
          supabase.from("gear_set_master_list").select("id, set_name").order("set_name"),
          supabase.from("hide_master_list").select("id, material_name").order("material_name"),
          supabase.from("mod_master_list").select("id, mod_name").order("mod_name"),
          supabase.from("weapon_master_list").select("id, weapon_name").order("weapon_name"),
        ])

        setMasterData({
          calibrations: calibRes.data || [],
          cradleItems: cradleRes.data || [],
          abilities: abilityRes.data || [],
          gearSets: gearRes.data || [],
          hides: hideRes.data || [],
          mods: modRes.data || [],
          weapons: weaponRes.data || [],
        })
      } catch (err) {
        console.error("Error fetching master data:", err)
      } finally {
        setFetchingData(false)
      }
    }

    fetchMasterLists()
  }, [isAdmin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!buildName || saving) return

    setSaving(true)
    try {
      // 1. Create Build
      const { data: build, error: buildError } = await supabase
        .from("builds")
        .insert({ 
          build_name: buildName,
          calibration_id: calibrationId || null
        })
        .select()
        .single()

      if (buildError) throw buildError

      const build_id = build.id

      // 2. Insert Gear & Weapons
      const gearInserts = [
        ...Object.entries(gear).map(([slot, data]) => ({
          build_id,
          slot_name: slot,
          gear_set_id: data.id || null,
          hide_material_id: data.hideId || null,
          mod_id: data.modId || null
        })),
        { build_id, slot_name: "weapon_1", weapon_id: weapon1.id || null, mod_id: weapon1.modId || null },
        { build_id, slot_name: "weapon_2", weapon_id: weapon2.id || null, mod_id: weapon2.modId || null },
        { build_id, slot_name: "melee", weapon_id: melee.id || null, mod_id: melee.modId || null }
      ]

      await supabase.from("build_gear").insert(gearInserts.filter(g => g.gear_set_id || g.weapon_id || g.mod_id))

      // 3. Insert Cradle
      const cradleInserts = cradle
        .map((id, index) => ({ build_id, item_slot: index + 1, cradle_item_id: id }))
        .filter(c => c.cradle_item_id)
      
      if (cradleInserts.length > 0) {
        await supabase.from("build_cradle").insert(cradleInserts)
      }

      // 4. Insert Abilities
      const abilityInserts = abilities
        .map((id, index) => ({ build_id, ability_rank: index + 1, ability_master_id: id }))
        .filter(a => a.ability_master_id)

      if (abilityInserts.length > 0) {
        await supabase.from("build_ability_assignment").insert(abilityInserts)
      }

      alert("🚀 Build deployed successfully!")
      router.push("/")
    } catch (err: any) {
      console.error("Submission error:", err)
      alert(`❌ Strategy Failure: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || fetchingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase opacity-60">Initializing Neural Link...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="mx-auto max-w-5xl p-6 pb-20 space-y-8">
      <div className="flex items-center justify-between border-b border-border/30 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-glow-violet uppercase tracking-tight">Add New Build</h1>
          <p className="text-[10px] tracking-widest text-muted-foreground uppercase mt-1">Tactical Asset Integration System</p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-xs tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          [ ABORT_MISSION ]
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Basic Info */}
        <div className="glass-card rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-2 text-sm tracking-[0.3em] text-accent font-bold uppercase border-b border-border/20 pb-2">
            <Activity className="h-4 w-4" />
            Basic_Parameters
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">Build Name</label>
              <input
                required
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                placeholder="Enter tactical designation..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-foreground focus:border-primary/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">Calibration</label>
              <select
                value={calibrationId}
                onChange={(e) => setCalibrationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-foreground focus:border-primary/50 outline-none transition-all appearance-none"
              >
                <option value="">Select Calibration...</option>
                {masterData?.calibrations.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Weapons Section */}
        <div className="glass-card rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-2 text-sm tracking-[0.3em] text-accent font-bold uppercase border-b border-border/20 pb-2">
            <Sword className="h-4 w-4" />
            Weapons_Loadout
          </div>
          <div className="grid gap-6">
            {[
              { label: "Weapon 1", state: weapon1, setState: setWeapon1 },
              { label: "Weapon 2", state: weapon2, setState: setWeapon2 },
              { label: "Melee", state: melee, setState: setMelee },
            ].map((slot) => (
              <div key={slot.label} className="grid md:grid-cols-3 gap-4 p-4 border border-slate-800 rounded bg-secondary/10">
                <div className="flex items-center">
                  <span className="text-[10px] tracking-widest text-primary uppercase font-bold">{slot.label}</span>
                </div>
                <select
                  value={slot.state.id}
                  onChange={(e) => slot.setState({ ...slot.state, id: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-foreground focus:border-primary/50 outline-none"
                >
                  <option value="">Select Weapon...</option>
                  {masterData?.weapons.map((w) => (
                    <option key={w.id} value={w.id}>{w.weapon_name}</option>
                  ))}
                </select>
                <select
                  value={slot.state.modId}
                  onChange={(e) => slot.setState({ ...slot.state, modId: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-foreground focus:border-primary/50 outline-none"
                >
                  <option value="">Select Mod...</option>
                  {masterData?.mods.map((m) => (
                    <option key={m.id} value={m.id}>{m.mod_name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Gear Grid */}
        <div className="glass-card rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-2 text-sm tracking-[0.3em] text-accent font-bold uppercase border-b border-border/20 pb-2">
            <Shield className="h-4 w-4" />
            Tactical_Gear_Grid
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.keys(gear).map((slot) => (
              <div key={slot} className="space-y-3 p-4 border border-slate-800 rounded bg-secondary/10">
                <label className="text-[10px] tracking-widest text-primary uppercase font-bold">{slot}</label>
                <div className="space-y-2">
                  <select
                    value={gear[slot].id}
                    onChange={(e) => setGear({ ...gear, [slot]: { ...gear[slot], id: e.target.value } })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[11px] text-foreground focus:border-primary/50 outline-none transition-all"
                  >
                    <option value="">Base Item...</option>
                    {masterData?.gearSets.map((gs) => (
                      <option key={gs.id} value={gs.id}>{gs.set_name}</option>
                    ))}
                  </select>
                  <select
                    value={gear[slot].hideId}
                    onChange={(e) => setGear({ ...gear, [slot]: { ...gear[slot], hideId: e.target.value } })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[11px] text-foreground focus:border-primary/50 outline-none transition-all"
                  >
                    <option value="">Hide Material...</option>
                    {masterData?.hides.map((h) => (
                      <option key={h.id} value={h.id}>{h.material_name}</option>
                    ))}
                  </select>
                  <select
                    value={gear[slot].modId}
                    onChange={(e) => setGear({ ...gear, [slot]: { ...gear[slot], modId: e.target.value } })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[11px] text-foreground focus:border-primary/50 outline-none transition-all"
                  >
                    <option value="">Armor Mod...</option>
                    {masterData?.mods.map((m) => (
                      <option key={m.id} value={m.id}>{m.mod_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Systems Integration */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Cradle */}
          <div className="glass-card rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 text-sm tracking-[0.3em] text-accent font-bold uppercase border-b border-border/20 pb-2">
              <Crosshair className="h-4 w-4" />
              Cradle_Sync
            </div>
            <div className="grid grid-cols-2 gap-3">
              {cradle.map((val, i) => (
                <div key={i} className="space-y-1">
                  <label className="text-[9px] tracking-widest text-muted-foreground uppercase">Slot {i + 1}</label>
                  <select
                    value={val}
                    onChange={(e) => {
                      const next = [...cradle]
                      next[i] = e.target.value
                      setCradle(next)
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-foreground focus:border-primary/50 outline-none"
                  >
                    <option value="">Select Item...</option>
                    {masterData?.cradleItems.map((c) => (
                      <option key={c.id} value={c.id}>{c.item_name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Abilities */}
          <div className="glass-card rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 text-sm tracking-[0.3em] text-accent font-bold uppercase border-b border-border/20 pb-2">
              <Sparkles className="h-4 w-4" />
              Ability_Array
            </div>
            <div className="space-y-4">
              {abilities.map((val, i) => (
                <div key={i} className="space-y-1">
                  <label className="text-[9px] tracking-widest text-muted-foreground uppercase">Key Ability {i + 1}</label>
                  <select
                    value={val}
                    onChange={(e) => {
                      const next = [...abilities]
                      next[i] = e.target.value
                      setAbilities(next)
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-foreground focus:border-primary/50 outline-none"
                  >
                    <option value="">Select Ability...</option>
                    {masterData?.abilities.map((a) => (
                      <option key={a.id} value={a.id}>{a.ability_name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={saving || !buildName}
            className={`group relative flex items-center gap-3 px-12 py-4 bg-primary text-primary-foreground font-bold tracking-[0.2em] rounded border border-primary/50 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {saving ? "UPLOADING_DATA..." : "DEPLOY_BUILD"}
            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </form>
    </div>
  )
}
