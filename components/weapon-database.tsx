"use client"

import { Sword, Flame, Zap, Snowflake, Shield, ChevronRight, Star } from "lucide-react"

export type Weapon = {
  id: string
  name: string
  type: string
  element: "Burn" | "Shock" | "Frost" | "None"
  tier: "S" | "A" | "B" | "C"
  baseDmg: number
  fireRate: number
  magazine: number
  description: string
}

const tierColors: Record<string, string> = {
  S: "text-primary border-primary/50 bg-primary/10",
  A: "text-accent border-accent/50 bg-accent/10",
  B: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10",
  C: "text-muted-foreground border-border bg-muted/50",
}

const elementIcons: Record<string, React.ReactNode> = {
  Burn: <Flame className="h-3 w-3 text-orange-400" />,
  Shock: <Zap className="h-3 w-3 text-yellow-400" />,
  Frost: <Snowflake className="h-3 w-3 text-cyan-400" />,
  None: <Shield className="h-3 w-3 text-muted-foreground" />,
}

export const weapons: Weapon[] = [
  { id: "w1", name: "Storm Piercer", type: "Sniper", element: "Shock", tier: "S", baseDmg: 4250, fireRate: 42, magazine: 8, description: "High-caliber electromagnetic sniper with chain lightning on headshots." },
  { id: "w2", name: "Inferno Fang", type: "Assault Rifle", element: "Burn", tier: "S", baseDmg: 1850, fireRate: 720, magazine: 40, description: "Rapid-fire assault weapon that applies stacking burn damage over time." },
  { id: "w3", name: "Cryo Mauler", type: "Shotgun", element: "Frost", tier: "A", baseDmg: 3200, fireRate: 85, magazine: 6, description: "Close-range devastator that slows and freezes targets on impact." },
  { id: "w4", name: "Voltage SMG-X", type: "SMG", element: "Shock", tier: "A", baseDmg: 920, fireRate: 950, magazine: 50, description: "Ultra-fast firing SMG with electric arcing between nearby targets." },
  { id: "w5", name: "Ember Pistol", type: "Pistol", element: "Burn", tier: "B", baseDmg: 1100, fireRate: 380, magazine: 15, description: "Reliable sidearm with incendiary rounds for area denial." },
  { id: "w6", name: "Glacier Edge", type: "Melee", element: "Frost", tier: "S", baseDmg: 2800, fireRate: 0, magazine: 0, description: "Crystalline blade that creates frost patches on heavy attacks." },
  { id: "w7", name: "Havoc Launcher", type: "Heavy", element: "Burn", tier: "A", baseDmg: 8500, fireRate: 12, magazine: 4, description: "Explosive launcher that creates napalm zones on detonation." },
  { id: "w8", name: "Nullfire Carbine", type: "Assault Rifle", element: "None", tier: "B", baseDmg: 1650, fireRate: 650, magazine: 35, description: "Balanced kinetic rifle with no elemental properties but enhanced crit." },
  { id: "w9", name: "Arc Defender", type: "Shotgun", element: "Shock", tier: "B", baseDmg: 2800, fireRate: 95, magazine: 8, description: "Tactical shotgun emitting electrical pulses on each pellet hit." },
  { id: "w10", name: "Permafrost LMG", type: "Heavy", element: "Frost", tier: "S", baseDmg: 1200, fireRate: 550, magazine: 100, description: "Heavy suppression weapon that creates expanding frost fields." },
]

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function WeaponDatabase({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-2 text-xs tracking-widest text-accent">
        <Sword className="h-4 w-4" />
        WEAPON DATABASE // {weapons.length} ENTRIES
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {weapons.map((w) => (
          <div key={w.id} className="glass-card group rounded-lg p-4 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded border text-[10px] font-bold ${tierColors[w.tier]}`}>
                  {w.tier}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {w.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] tracking-wider text-muted-foreground">
                    <span>{w.type}</span>
                    <span className="text-border">|</span>
                    <span className="flex items-center gap-1">{elementIcons[w.element]} {w.element}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100" />
            </div>

            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground line-clamp-2">
              {w.description}
            </p>

            {/* Stats */}
            <div className="mt-3 space-y-2">
              <div>
                <div className="flex items-center justify-between text-[9px] tracking-wider">
                  <span className="text-muted-foreground">BASE DMG</span>
                  <span className="text-foreground">{w.baseDmg.toLocaleString()}</span>
                </div>
                <MiniBar value={w.baseDmg} max={10000} color="bg-primary" />
              </div>
              {w.fireRate > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[9px] tracking-wider">
                    <span className="text-muted-foreground">FIRE RATE</span>
                    <span className="text-foreground">{w.fireRate} RPM</span>
                  </div>
                  <MiniBar value={w.fireRate} max={1000} color="bg-accent" />
                </div>
              )}
              {w.magazine > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[9px] tracking-wider">
                    <span className="text-muted-foreground">MAGAZINE</span>
                    <span className="text-foreground">{w.magazine}</span>
                  </div>
                  <MiniBar value={w.magazine} max={100} color="bg-emerald-400" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
