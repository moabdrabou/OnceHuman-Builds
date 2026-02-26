"use client"

import { Search, X } from "lucide-react"

export function NeuralSearch({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="relative w-full">
      <div className="glass-card flex items-center gap-3 rounded-lg px-4 py-3">
        <Search className="h-4 w-4 shrink-0 text-primary animate-pulse-glow" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="NEURAL LINK SEARCH // Enter build name, weapon, or tag..."
          className="w-full bg-transparent text-xs tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
        <div className="hidden shrink-0 items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[9px] text-muted-foreground sm:flex">
          CTRL+K
        </div>
      </div>
      {/* Scan line effect */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  )
}
