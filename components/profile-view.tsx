"use client"

import { User, Star, Eye, Shield, Sword, Trophy, Target, Clock } from "lucide-react"
import { EnrichedBuild } from "@/hooks/use-builds"

export function ProfileView({
  builds,
  onSelectBuild,
}: {
  builds: EnrichedBuild[]
  onSelectBuild: (build: EnrichedBuild) => void
}) {
  const totalViews = builds.reduce((sum, b) => sum + b.views, 0)
  const avgRating = builds.length > 0 ? (builds.reduce((sum, b) => sum + b.rating, 0) / builds.length).toFixed(1) : "0"

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Profile Header */}
      <div className="glass-card rounded-lg p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 glow-border">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground text-glow-violet">
              OPERATIVE_7X
            </h1>
            <p className="text-[10px] tracking-widest text-muted-foreground">
              RANK: VETERAN // JOINED: 2025.03.15
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] tracking-wider text-primary">
                <Trophy className="h-3 w-3" />
                TOP 5% BUILDER
              </span>
              <span className="flex items-center gap-1 rounded border border-accent/30 bg-accent/10 px-2 py-0.5 text-[9px] tracking-wider text-accent">
                <Target className="h-3 w-3" />
                PVP SPECIALIST
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "BUILDS", value: builds.length.toString(), icon: <Shield className="h-4 w-4 text-primary" /> },
            { label: "TOTAL VIEWS", value: totalViews.toLocaleString(), icon: <Eye className="h-4 w-4 text-accent" /> },
            { label: "AVG RATING", value: avgRating, icon: <Star className="h-4 w-4 text-amber-400" /> },
            { label: "ACTIVE SINCE", value: "127d", icon: <Clock className="h-4 w-4 text-emerald-400" /> },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-lg p-3 text-center">
              <div className="flex items-center justify-center">{stat.icon}</div>
              <p className="mt-1 text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[9px] tracking-widest text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User Builds */}
      <div>
        <div className="mb-4 flex items-center gap-2 text-xs tracking-widest text-accent">
          <Sword className="h-4 w-4" />
          MY BUILDS // {builds.length} LOADOUTS
        </div>
        {builds.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {builds.map((build) => (
              <button
                key={build.id}
                onClick={() => onSelectBuild(build)}
                className="glass-card group w-full rounded-lg p-4 text-left transition-all hover:translate-y-[-2px]"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded border border-primary/40 bg-primary/10 text-[10px] font-bold text-primary">
                    {build.tier}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {build.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">{build.weapon}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-2.5 w-2.5 ${i < build.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {build.views.toLocaleString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-lg p-8 text-center">
            <Shield className="mx-auto h-8 w-8 text-muted-foreground/30" />
            <p className="mt-2 text-xs text-muted-foreground">No builds created yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
