"use client"

import { Shield, Sword, Zap, Flame, Snowflake, Eye, Star, ChevronRight, Sparkles, Waypoints, ArrowBigUpDash, ChessRook, Atom, Crosshair, Bomb } from "lucide-react"

import { EnrichedBuild } from "@/hooks/use-builds"

const elementIcons: Record<string, React.ReactNode> = {
  Burn: <Flame className="h-3 w-3 text-orange-400" />,
  Shock: <Zap className="h-3 w-3 text-yellow-400" />,
  Frost: <Snowflake className="h-3 w-3 text-cyan-400" />,
  Bounce: <Waypoints className="h-3 w-3 text-lime-400" />,
  Crit: <Sword className="h-3 w-3 text-red-500" />,
  "Fast Gunner": <ArrowBigUpDash className="h-3 w-3 text-teal-400" />,
  "Fortress Warfare": <ChessRook className="h-3 w-3 text-orange-800" />,
  "Frost Vortex": <Snowflake className="h-3 w-3 text-cyan-400" />,
  "Power Surge": <Zap className="h-3 w-3 text-indigo-400" />,
  Shrapnel: <Atom className="h-3 w-3 text-slate-300" />,
  "The Bull's Eye": <Crosshair className="h-3 w-3 text-emerald-400" />,
  "Unstable Bomber": <Bomb className="h-3 w-3 text-amber-400" />,
  None: <Shield className="h-3 w-3 text-muted-foreground" />,
}

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


const tierColors: Record<string, string> = {
  S: "text-primary bg-primary/10 border-primary/50",
  A: "text-accent bg-accent/10 border-accent/50",
  B: "text-emerald-400 bg-emerald-400/10 border-emerald-400/50",
  C: "text-muted-foreground bg-muted/50 border-border",
}

export function GearCard({
  build,
  onClick,
}: {
  build: EnrichedBuild
  onClick: () => void
}) {
  if (!build || !build.id) return null

  return (
    <button
      onClick={onClick}
      className="glass-card group w-full rounded-lg p-4 text-left transition-all duration-300 hover:translate-y-[-2px]"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded border text-xs font-bold transition-all duration-300 ${
              dmgTypeConfig[build.dmgType]?.color || "text-muted-foreground border-border bg-muted/50"
            }`}
          >
            {dmgTypeConfig[build.dmgType]?.short || "?"}
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {build.name}
            </h3>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="flex items-center gap-1 rounded border border-border bg-secondary/50 px-1.5 py-0.5 text-xs tracking-wider text-secondary-foreground">
          <Sword className="h-3 w-3" />
          {build.weapon}
        </span>
        <span className="flex items-center gap-1 rounded border border-border bg-secondary/50 px-1.5 py-0.5 text-xs tracking-wider text-secondary-foreground">
          {elementIcons[build.dmgType] || elementIcons["None"]}
          {build.dmgType}
        </span>
      </div>

      {/* Calibration Footer */}
      <div className="mt-4 flex items-center gap-2 border-t border-border/30 pt-3 text-[10px] font-bold tracking-widest text-primary uppercase break-words whitespace-normal">
        <Sparkles className="h-3 w-3 shrink-0 text-orange-400" />
        <span className="text-muted-foreground">CALIBRATION:</span> {build.calibration}
      </div>
    </button>
  )
}
