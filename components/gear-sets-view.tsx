"use client"

import { Shield, Sword, Crosshair, Flame, Zap, Snowflake, Layers } from "lucide-react"
import type { Build } from "@/components/gear-card"

export function GearSetsView() {
  const gearSets = [
    {
      name: "Stormcaller Protocol",
      element: "Shock",
      pieces: 6,
      bonus2: "+15% Shock Damage",
      bonus4: "+25% Chain Lightning Chance",
      bonus6: "Shock Overload: Crits trigger AoE burst",
      icon: <Zap className="h-6 w-6 text-yellow-400" />,
      tier: "S",
    },
    {
      name: "Inferno Dominion",
      element: "Burn",
      pieces: 6,
      bonus2: "+15% Burn Damage",
      bonus4: "+30% Burn Duration",
      bonus6: "Molten Core: Burns stack up to 5x for exponential damage",
      icon: <Flame className="h-6 w-6 text-orange-400" />,
      tier: "S",
    },
    {
      name: "Permafrost Bastion",
      element: "Frost",
      pieces: 6,
      bonus2: "+15% Frost Damage",
      bonus4: "+20% Slow Potency",
      bonus6: "Absolute Zero: Frozen targets take 50% more crit damage",
      icon: <Snowflake className="h-6 w-6 text-cyan-400" />,
      tier: "S",
    },
    {
      name: "Vanguard Fortress",
      element: "None",
      pieces: 6,
      bonus2: "+500 Defense",
      bonus4: "+10000 HP",
      bonus6: "Iron Will: Reduce incoming damage by 25% below 50% HP",
      icon: <Shield className="h-6 w-6 text-emerald-400" />,
      tier: "A",
    },
    {
      name: "Phantom Striker",
      element: "None",
      pieces: 6,
      bonus2: "+12% Crit Rate",
      bonus4: "+40% Crit Damage",
      bonus6: "Ghost Protocol: Crits grant 3s invisibility (30s CD)",
      icon: <Crosshair className="h-6 w-6 text-primary" />,
      tier: "A",
    },
    {
      name: "Berserker Warframe",
      element: "Burn",
      pieces: 4,
      bonus2: "+20% Melee Damage",
      bonus4: "Blood Frenzy: Each kill increases ATK by 5% for 10s, stacks 5x",
      bonus6: null,
      icon: <Sword className="h-6 w-6 text-red-400" />,
      tier: "A",
    },
  ]

  const tierColors: Record<string, string> = {
    S: "text-primary border-primary/50 bg-primary/10",
    A: "text-accent border-accent/50 bg-accent/10",
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-2 text-xs tracking-widest text-accent">
        <Layers className="h-4 w-4" />
        GEAR SET DATABASE // {gearSets.length} SETS
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {gearSets.map((set) => (
          <div key={set.name} className="glass-card group rounded-lg p-5 transition-all">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/50 transition-all group-hover:border-primary/30">
                {set.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {set.name}
                  </h3>
                  <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${tierColors[set.tier]}`}>
                    {set.tier}
                  </span>
                </div>
                <p className="text-[10px] tracking-wider text-muted-foreground">
                  {set.pieces}-PIECE SET // {set.element}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="rounded border border-border/50 bg-secondary/30 px-3 py-2">
                <span className="text-[9px] font-bold tracking-widest text-primary">2-PIECE</span>
                <p className="text-[11px] text-foreground">{set.bonus2}</p>
              </div>
              <div className="rounded border border-border/50 bg-secondary/30 px-3 py-2">
                <span className="text-[9px] font-bold tracking-widest text-accent">4-PIECE</span>
                <p className="text-[11px] text-foreground">{set.bonus4}</p>
              </div>
              {set.bonus6 && (
                <div className="rounded border border-primary/30 bg-primary/5 px-3 py-2">
                  <span className="text-[9px] font-bold tracking-widest text-primary">6-PIECE</span>
                  <p className="text-[11px] text-foreground">{set.bonus6}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
