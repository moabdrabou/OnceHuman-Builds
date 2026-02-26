"use client"

import { useState, useMemo } from "react"
import { TacticalNav } from "@/components/tactical-nav"
import { NeuralSearch } from "@/components/neural-search"
import { GearCard } from "@/components/gear-card"
import { EnrichedBuild } from "@/hooks/use-builds"
import { FilterPanel } from "@/components/filter-panel"
import { BuildDetail } from "@/components/build-detail"
import { useBuilds } from "@/hooks/use-builds"
import { useAuth } from "@/components/auth-provider"
import { Shield, Sword, Flame, Zap, Snowflake, TrendingUp, Activity, Wifi, WifiOff, AlertTriangle, User } from "lucide-react"

type View = "builds" | "detail"

export default function OnceHumanTracker() {
  const { builds, loading, error } = useBuilds()
  const { user } = useAuth()
  const [activeView, setActiveView] = useState<View>("builds")
  const [selectedBuild, setSelectedBuild] = useState<EnrichedBuild | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    element: "All",
  })

  const filteredBuilds = useMemo(() => {
    return builds.filter((build) => {
      const matchSearch =
        !searchQuery ||
        build.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        build.gearList.some(g => g.item.toLowerCase().includes(searchQuery.toLowerCase())) ||
        build.calibration.toLowerCase().includes(searchQuery.toLowerCase())

      const matchElement = filters.element === "All" || build.dmgType === filters.element

      return matchSearch && matchElement
    })
  }, [builds, searchQuery, filters])

  const handleNavigate = (view: string) => {
    setActiveView(view as View)
    if (view === "builds") setSelectedBuild(null)
  }

  const handleSelectBuild = (build: EnrichedBuild) => {
    setSelectedBuild(build)
    setActiveView("detail")
  }


  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <div className="relative">
          <Activity className="h-16 w-16 text-primary animate-pulse" />
          <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
        </div>
        <div className="mt-8 space-y-2">
          <h2 className="text-xl font-bold tracking-[0.2em] text-primary animate-glitch">NEURAL_LINK: ESTABLISHING CONNECTION</h2>
          <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase opacity-50">Synchronizing tactical database // Handshake in progress</p>
        </div>
        <div className="mt-12 w-48 h-1 bg-muted overflow-hidden rounded-full">
          <div className="h-full bg-primary animate-progress-flow" style={{ width: '40%' }}></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive animate-bounce" />
        <div className="mt-8 space-y-2">
          <h2 className="text-xl font-bold tracking-[0.2em] text-destructive">CONNECTION_FAILURE</h2>
          <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">{error.message}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 glass px-6 py-2 text-[10px] tracking-widest text-foreground hover:text-primary transition-all"
        >
          RETRY_CONNECTION
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TacticalNav activeView={activeView === "detail" ? "builds" : activeView} onNavigate={handleNavigate} />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Builds Dashboard */}
        {activeView === "builds" && (
          <div className="space-y-6">

            {/* Search */}
            <NeuralSearch value={searchQuery} onChange={setSearchQuery} />

            {/* Filters */}
            <FilterPanel filters={filters} onFilterChange={setFilters} />

            {/* Results Header */}
            <div className="flex items-center justify-between text-[10px] tracking-widest text-muted-foreground">
              <span>
                SHOWING {filteredBuilds.length} OF {builds.length} BUILDS
              </span>
              <span className="flex items-center gap-1">
                <Wifi className="h-3 w-3 text-accent animate-pulse-glow" />
                LIVE_LINK ACTIVE
              </span>
            </div>

            {/* Build Grid */}
            {filteredBuilds.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBuilds.map((build) => (
                  <GearCard key={build.id} build={build as any} onClick={() => handleSelectBuild(build)} />
                ))}
              </div>
            ) : (
              <div className="glass-card flex flex-col items-center justify-center rounded-lg py-16">
                <WifiOff className="h-10 w-10 text-muted-foreground/20" />
                <p className="mt-3 text-sm text-muted-foreground">NO BUILDS MATCH YOUR FILTERS</p>
                <p className="text-[10px] text-muted-foreground/60">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Build Detail */}
        {activeView === "detail" && selectedBuild && (
          <BuildDetail build={selectedBuild} onBack={() => setActiveView("builds")} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border/30 py-6 text-center">
        <p className="text-[10px] tracking-widest text-muted-foreground/50">
          ONCE HUMAN BUILD TRACKER // TACTICAL INTERFACE v2 // SECURITY STATUS: {user ? 'ADMIN_SECURED' : 'PUBLIC_READ_ONLY'}
        </p>
      </footer>
    </div>
  )
}
