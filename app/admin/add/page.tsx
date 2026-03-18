"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Save, Activity, Shield, Sword, Crosshair, Sparkles, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { CreatableCombobox, type ComboboxOption } from "@/components/admin/creatable-combobox"
import { resolveValue, resolveValues } from "@/lib/jit-insert"

interface MasterData {
  calibrations: any[]
  cradleItems: any[]
  abilities: any[]
  gearSets: any[]
  hides: any[]
  mods: any[]
  weapons: any[]
}

function toOptions(items: any[], labelKey: string): ComboboxOption[] {
  return items.map((item) => ({ value: item.id, label: item[labelKey] }))
}

export default function AdminAddPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()

  const [masterData, setMasterData] = useState<MasterData | null>(null)
  const [fetchingData, setFetchingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingStatus, setSavingStatus] = useState("")

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
      // Phase 1: Resolve all new items into UUIDs via JIT insertion
      setSavingStatus("Creating new items...")

      const [resolvedCalibration] = await Promise.all([
        resolveValue("calibration", calibrationId),
      ])

      const [w1Id, w1Mod, w2Id, w2Mod, meleeId, meleeMod] = await Promise.all([
        resolveValue("weapon", weapon1.id),
        resolveValue("mod", weapon1.modId),
        resolveValue("weapon", weapon2.id),
        resolveValue("mod", weapon2.modId),
        resolveValue("weapon", melee.id),
        resolveValue("mod", melee.modId),
      ])

      const gearSlots = Object.entries(gear)
      const gearResolved = await Promise.all(
        gearSlots.map(async ([, data]) => ({
          id: await resolveValue("gearSet", data.id),
          hideId: await resolveValue("hide", data.hideId),
          modId: await resolveValue("mod", data.modId),
        })),
      )

      const resolvedCradle = await resolveValues("cradle", cradle)
      const resolvedAbilities = await resolveValues("ability", abilities)

      // Phase 2: Create Build
      setSavingStatus("Deploying build...")

      const { data: build, error: buildError } = await supabase
        .from("builds")
        .insert({
          build_name: buildName,
          calibration_id: resolvedCalibration,
        })
        .select()
        .single()

      if (buildError) throw buildError

      const build_id = build.id

      // Phase 3: Insert Gear & Weapons
      const gearInserts = [
        ...gearSlots.map(([slot], i) => ({
          build_id,
          slot_name: slot,
          gear_set_id: gearResolved[i].id,
          hide_material_id: gearResolved[i].hideId,
          mod_id: gearResolved[i].modId,
        })),
        { build_id, slot_name: "weapon_1", weapon_id: w1Id, mod_id: w1Mod },
        { build_id, slot_name: "weapon_2", weapon_id: w2Id, mod_id: w2Mod },
        { build_id, slot_name: "melee", weapon_id: meleeId, mod_id: meleeMod },
      ]

      await supabase.from("build_gear").insert(
        (gearInserts as any[]).filter((g) => g.gear_set_id || g.weapon_id || g.mod_id),
      )

      // Phase 4: Insert Cradle
      const cradleInserts = resolvedCradle
        .map((id, index) => ({ build_id, item_slot: index + 1, cradle_item_id: id }))
        .filter((c) => c.cradle_item_id)

      if (cradleInserts.length > 0) {
        await supabase.from("build_cradle").insert(cradleInserts)
      }

      // Phase 5: Insert Abilities
      const abilityInserts = resolvedAbilities
        .map((id, index) => ({ build_id, ability_rank: index + 1, ability_master_id: id }))
        .filter((a) => a.ability_master_id)

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
      setSavingStatus("")
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

  const weaponOptions = toOptions(masterData?.weapons || [], "weapon_name")
  const modOptions = toOptions(masterData?.mods || [], "mod_name")
  const gearSetOptions = toOptions(masterData?.gearSets || [], "set_name")
  const hideOptions = toOptions(masterData?.hides || [], "material_name")
  const calibrationOptions = toOptions(masterData?.calibrations || [], "name")
  const cradleOptions = toOptions(masterData?.cradleItems || [], "item_name")
  const abilityOptions = toOptions(masterData?.abilities || [], "ability_name")

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
              <CreatableCombobox
                options={calibrationOptions}
                value={calibrationId}
                onChange={setCalibrationId}
                placeholder="Select Calibration..."
                searchPlaceholder="Search calibrations..."
                className="py-2 text-sm"
              />
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
                <CreatableCombobox
                  options={weaponOptions}
                  value={slot.state.id}
                  onChange={(v) => slot.setState({ ...slot.state, id: v })}
                  placeholder="Select Weapon..."
                  searchPlaceholder="Search weapons..."
                />
                <CreatableCombobox
                  options={modOptions}
                  value={slot.state.modId}
                  onChange={(v) => slot.setState({ ...slot.state, modId: v })}
                  placeholder="Select Mod..."
                  searchPlaceholder="Search mods..."
                />
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
                  <CreatableCombobox
                    options={gearSetOptions}
                    value={gear[slot].id}
                    onChange={(v) => setGear({ ...gear, [slot]: { ...gear[slot], id: v } })}
                    placeholder="Base Item..."
                    searchPlaceholder="Search gear sets..."
                  />
                  <CreatableCombobox
                    options={hideOptions}
                    value={gear[slot].hideId}
                    onChange={(v) => setGear({ ...gear, [slot]: { ...gear[slot], hideId: v } })}
                    placeholder="Hide Material..."
                    searchPlaceholder="Search hides..."
                  />
                  <CreatableCombobox
                    options={modOptions}
                    value={gear[slot].modId}
                    onChange={(v) => setGear({ ...gear, [slot]: { ...gear[slot], modId: v } })}
                    placeholder="Armor Mod..."
                    searchPlaceholder="Search mods..."
                  />
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
                  <CreatableCombobox
                    options={cradleOptions}
                    value={val}
                    onChange={(v) => {
                      const next = [...cradle]
                      next[i] = v
                      setCradle(next)
                    }}
                    placeholder="Select Item..."
                    searchPlaceholder="Search cradle..."
                    className="text-[10px]"
                  />
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
                  <CreatableCombobox
                    options={abilityOptions}
                    value={val}
                    onChange={(v) => {
                      const next = [...abilities]
                      next[i] = v
                      setAbilities(next)
                    }}
                    placeholder="Select Ability..."
                    searchPlaceholder="Search abilities..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col items-center gap-2 pt-6">
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
          {savingStatus && (
            <p className="text-[10px] tracking-widest text-primary/70 uppercase animate-pulse">
              {savingStatus}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
