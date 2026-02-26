"use client"

import { useState } from "react"
import { Shield, Sword, Layers, User, Crosshair, Activity, Lock, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { AdminLoginModal } from "./admin-login-modal"

export function TacticalNav({
  activeView,
  onNavigate,
}: {
  activeView: string
  onNavigate: (view: string) => void
}) {
  const { user, isAdmin, signOut } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  return (
    <nav className="glass sticky top-0 z-50 border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <button
          onClick={() => onNavigate("builds")}
          className="flex items-center gap-2 group"
        >
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-primary/40 bg-primary/10 glow-border">
            <img src="/OH32x32.png" alt="OH" className="h-6 w-6 object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-widest text-foreground text-glow-violet">
              ONCE HUMAN
            </span>
            <span className="text-[10px] tracking-[0.3em] text-accent">
              BUILD TRACKER
            </span>
          </div>
        </button>

        {/* Nav Links - Strictly Reduced */}
        <div className="hidden items-center gap-4 md:flex">
          <button
            onClick={() => onNavigate("builds")}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs tracking-wider transition-all duration-200 ${
              activeView === "builds"
                ? "border border-primary/50 bg-primary/10 text-primary glow-border"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            ALL BUILDS
          </button>

          {isAdmin && (
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <a
                href="/admin/add"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-xs tracking-wider text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              >
                <Lock className="h-4 w-4" />
                ADD BUILD
              </a>
              <a
                href="/admin/edit"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-xs tracking-wider text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              >
                <Lock className="h-4 w-4" />
                EDIT A BUILD
              </a>
              <a
                href="/admin/delete"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-xs tracking-wider text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              >
                <Lock className="h-4 w-4" />
                DELETE A BUILD
              </a>
            </div>
          )}
        </div>

        {/* Status & Auth */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-[10px] tracking-wider text-muted-foreground lg:flex">
            <Activity className="h-3 w-3 text-accent animate-pulse-glow" />
            <span className="text-glow-cyan uppercase">System Online</span>
          </div>

          {!user ? (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-[10px] font-bold tracking-widest text-primary transition-all hover:bg-primary/20"
            >
              <Lock className="h-3.5 w-3.5" />
              ADMIN_LOGIN
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end leading-tight">
                <span className="text-[10px] font-bold text-foreground tracking-wider uppercase">
                  {isAdmin ? "Admin_User" : "Operative"}
                </span>
                <span className="text-[8px] text-muted-foreground uppercase opacity-60">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="rounded-md border border-border p-2 text-muted-foreground hover:bg-secondary hover:text-destructive transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <AdminLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </nav>
  )
}
