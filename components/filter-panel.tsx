"use client"

import { useState } from "react"
import { Filter, X, Flame, Zap, Snowflake, Shield, Waypoints, Sword, ArrowBigUpDash, ChessRook, Atom, Crosshair, Bomb } from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"

type Filters = {
  element: string
}
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


export function FilterPanel({
  filters,
  onFilterChange,
}: {
  filters: Filters
  onFilterChange: (filters: Filters) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: master } = useMasterData()

  const dmgTypes = ["All", ...(master?.dmgTypes?.map(d => d.label) || [])]
  // Fallback to hardcoded list if database is empty 
  const displayDmgTypes = dmgTypes.length > 1 ? dmgTypes : [
    "All", "Bounce", "Burn", "Fast Gunner", "Fortress Warfare", "Frost Vortex", "Power Surge", "Shrapnel", "The Bull's Eye", "Unstable Bomber"
  ]

  const updateFilter = (key: keyof Filters, val: string) => {
    onFilterChange({ ...filters, [key]: val })
  }

  const resetFilters = () => {
    onFilterChange({ element: "All" })
  }

  const hasActiveFilters =
    filters.element !== "All"

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-card flex w-full items-center justify-between rounded-lg px-4 py-3 text-xs tracking-wider transition-all"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-accent" />
          <span className="text-foreground">TACTICAL FILTERS</span>
          {hasActiveFilters && (
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[9px] text-primary">
              ACTIVE
            </span>
          )}
        </div>
        <span className="text-muted-foreground">{isOpen ? "[-]" : "[+]"}</span>
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="mt-2 grid gap-4 rounded-lg border border-border/50 bg-secondary/30 p-4 backdrop-blur-sm">

          {/* Element Toggle as DMG Type */}
          <div>
            <label className="mb-2 block text-[10px] tracking-widest text-muted-foreground">
              DMG TYPE
            </label>
            <div className="flex flex-wrap gap-1">
              {displayDmgTypes.map((name) => (
                <button
                  key={name}
                  onClick={() => updateFilter("element", name)}
                  className={`flex items-center gap-1.5 rounded border px-2 py-1 text-[10px] tracking-wider transition-all ${
                    filters.element === name
                      ? "border-accent/50 bg-accent/10 text-accent"
                      : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {elementIcons[name]}
                  {name}
                </button>
              ))}
            </div>
          </div>


          {/* Reset */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 rounded border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-[10px] tracking-wider text-destructive transition-all hover:bg-destructive/10"
              >
                <X className="h-3 w-3" />
                RESET ALL FILTERS
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
