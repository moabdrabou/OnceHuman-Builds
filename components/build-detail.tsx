"use client"

import {
  ArrowLeft,
  Sword,
  Flame,
  Zap,
  Snowflake,
  Shield,
  HardHat,
  Shirt,
  Footprints,
  Hand,
  Watch,
  Crosshair,
  Sparkles,
  Waypoints,
  ArrowBigUpDash,
  ChessRook,
  Atom,
  Bomb,
} from "lucide-react"
import { WeaponIcon } from "./weapon-icons"
import { EnrichedBuild } from "@/hooks/use-builds"

const elementIcons: Record<string, React.ReactNode> = {
  Burn: <Flame className="h-4 w-4 text-orange-400" />,
  Shock: <Zap className="h-4 w-4 text-yellow-400" />,
  Frost: <Snowflake className="h-4 w-4 text-cyan-400" />,
  Bounce: <Waypoints className="h-4 w-4 text-lime-400" />,
  Crit: <Sword className="h-4 w-4 text-red-500" />,
  "Fast Gunner": <ArrowBigUpDash className="h-4 w-4 text-teal-400" />,
  "Fortress Warfare": <ChessRook className="h-4 w-4 text-orange-800" />,
  "Frost Vortex": <Snowflake className="h-4 w-4 text-cyan-400" />,
  "Power Surge": <Zap className="h-4 w-4 text-indigo-400" />,
  Shrapnel: <Atom className="h-4 w-4 text-slate-300" />,
  "The Bull's Eye": <Crosshair className="h-4 w-4 text-emerald-400" />,
  "Unstable Bomber": <Bomb className="h-4 w-4 text-amber-400" />,
  None: <Shield className="h-4 w-4 text-muted-foreground" />,
}

const MaskIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 21c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" />
    <path d="M9 11h.01M15 11h.01" />
    <path d="M12 17c-1.5 0-2.5-1-2.5-1s1-1 2.5-1 2.5 1 2.5 1-1 1-2.5 1z" />
  </svg>
);

const PantsIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 3l4 0 2 8 2-8 4 0 0 18-6-2-6 2z" />
    <path d="M5 8h14" />
  </svg>
);



const gearSlots = [
  { key: "helmet", label: "HELMET", icon: <HardHat className="h-5 w-5" /> },
  { key: "mask", label: "MASK", icon: <MaskIcon className="h-5 w-5" /> },
  { key: "jacket", label: "JACKET", icon: <Shirt className="h-5 w-5" /> },
  { key: "gloves", label: "GLOVES", icon: <Hand className="h-5 w-5" /> },
  { key: "pants", label: "PANTS", icon: <PantsIcon className="h-5 w-5" /> },
  { key: "boots", label: "BOOTS", icon: <Footprints className="h-5 w-5" /> },
]

const dmgTypeConfig: Record<string, { short: string; color: string }> = {
  "Burn": { short: "B", color: "border-orange-500/50 text-orange-400 bg-orange-500/10" },
  "Frost Vortex": { short: "F", color: "border-cyan-500/50 text-cyan-400 bg-cyan-500/10" },
  "Power Surge": { short: "P", color: "border-indigo-500/50 text-indigo-400 bg-indigo-500/10" },
  "Unstable Bomber": { short: "U", color: "border-amber-500/50 text-amber-400 bg-amber-500/10" },
  "The Bull's Eye": { short: "E", color: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" },
  "Shrapnel": { short: "S", color: "border-slate-400/50 text-slate-300 bg-slate-400/10" },
  "Fast Gunner": { short: "FG", color: "border-teal-500/50 text-teal-400 bg-teal-500/10" },
  "Bounce": { short: "BN", color: "border-lime-500/50 text-lime-400 bg-lime-500/10" },
  "Fortress Warfare": { short: "FW", color: "border-orange-900/50 text-orange-800 bg-orange-900/10" },
}

export function BuildDetail({
  build,
  onBack,
}: {
  build: EnrichedBuild
  onBack: () => void
}) {
  const dmgConfig = dmgTypeConfig[build.dmgType] || { short: "??", color: "border-muted-foreground/50 text-muted-foreground bg-muted-foreground/10" }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm tracking-wider text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        BACK TO BUILDS
      </button>

      {/* Header */}
      <div className="glass-card rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground text-glow-violet uppercase tracking-tight">
              {build.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm tracking-widest text-muted-foreground uppercase opacity-60">
                Calibration: <span className="text-primary font-bold">{build.calibration}</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className={`flex h-14 w-14 items-center justify-center rounded-md border text-2xl font-bold transition-all shadow-lg ${dmgConfig.color}`}>
                {dmgConfig.short}
              </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Loadout Grid - Detailed View */}
        <div className="glass-card rounded-lg p-6">
          <div className="mb-6 flex items-center gap-2 text-sm tracking-[0.3em] text-accent uppercase font-bold">
            <Shield className="h-4 w-4" />
            Tactical_Loadout_Grid
          </div>
          <div className="grid grid-cols-2 gap-4">
            {gearSlots.map((slot) => {
              const data = build.gear[slot.key];
              return (
                <div
                  key={slot.key}
                  className="group glass-card flex flex-col items-start gap-1 rounded-lg border border-border/40 bg-secondary/20 p-4 transition-all hover:border-accent/40"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="text-muted-foreground group-hover:text-accent transition-colors">
                      {slot.icon}
                    </div>
                    <span className="text-xs tracking-[0.2em] text-muted-foreground font-bold uppercase">
                      {slot.label}
                    </span>
                  </div>
                  <div className="space-y-1 w-full scale-95 origin-top-left min-w-0">
                    <p className="text-sm font-bold text-slate-100 break-words whitespace-normal">
                      {data?.item || "N/A"}
                    </p>
                    <p className="text-xs font-semibold break-words whitespace-normal uppercase">
                      <span className="text-muted-foreground">HIDE:</span> <span className="text-emerald-400 opacity-90">{data?.hide || "N/A"}</span>
                    </p>
                    <p className="text-xs font-semibold break-words whitespace-normal uppercase">
                      <span className="text-muted-foreground">MOD:</span> <span className="text-orange-400 opacity-90">{data?.mod || "N/A"}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {/* Weapons Loadout */}
          <div className="glass-card rounded-lg p-6">
            <div className="mb-4 flex items-center gap-2 text-sm tracking-[0.3em] text-accent font-bold uppercase">
              <Sword className="h-4 w-4" />
              WEAPONS_LOADOUT
            </div>
            <div className="space-y-3">
              {[
                { 
                  label: "Weapon 1", 
                  data: build.weapons.primary, 
                  icon: <WeaponIcon type="SniperRifle" className="text-4xl text-slate-300 hover:text-cyan-400 transition-colors" /> 
                },
                { 
                  label: "Weapon 2", 
                  data: build.weapons.secondary, 
                  icon: <WeaponIcon type="Pistol" className="text-4xl text-slate-300 hover:text-cyan-400 transition-colors" /> 
                },
                { 
                  label: "Melee", 
                  data: build.weapons.melee, 
                  icon: <WeaponIcon type="Melee" className="text-4xl text-slate-300 hover:text-cyan-400 transition-colors" /> 
                },
              ].map((w) => (
                <div key={w.label} className="flex flex-col gap-1 rounded border border-border/30 bg-secondary/20 px-4 py-3 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="shrink-0">{w.icon}</div>
                      <span className="text-sm font-bold text-foreground text-glow-cyan uppercase break-words whitespace-normal">{w.data.item}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] tracking-widest font-bold uppercase break-words whitespace-normal">
                    <span className="text-muted-foreground">MOD:</span> <span className="text-orange-400 opacity-80">{w.data.mod}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cradle Items */}
          <div className="glass-card rounded-lg p-6">
            <div className="mb-4 flex items-center gap-2 text-sm tracking-[0.3em] text-accent font-bold uppercase">
              <Crosshair className="h-4 w-4" />
              CRADLE_ITEMS
            </div>
            <div className="flex flex-wrap gap-2 min-w-0">
              {build.cradle.length > 0 ? build.cradle.map((item, i) => (
                <div key={i} className="rounded border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs tracking-wider text-primary font-bold break-words whitespace-normal max-w-full">
                  {item}
                </div>
              )) : <span className="text-xs text-muted-foreground italic">NO_DATA_SYNCED</span>}
            </div>
          </div>

          {/* Key Abilities */}
          <div className="glass-card rounded-lg p-6 border-l-4 border-l-accent">
            <div className="mb-4 flex items-center gap-2 text-sm tracking-[0.3em] text-accent font-bold uppercase">
              <Sparkles className="h-4 w-4" />
              KEY_ABILITIES
            </div>
            <div className="space-y-2 min-w-0">
              {build.abilities.length > 0 ? build.abilities.map((ability, i) => (
                <div key={i} className="flex items-center gap-3 rounded border border-border/30 bg-secondary/10 px-3 py-2">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs tracking-wider text-foreground font-bold break-words whitespace-normal">{ability}</span>
                </div>
              )) : <span className="text-xs text-muted-foreground italic">NO_DATA_SYNCED</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
