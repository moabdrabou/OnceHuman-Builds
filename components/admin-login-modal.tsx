"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X, Lock, Mail, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function AdminLoginModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      onClose()
    } catch (err: any) {
      setError(err.message || "UNAUTHORIZED_ACCESS_DENIED")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] space-y-6 rounded-lg border border-border bg-background p-8 shadow-2xl glow-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold tracking-widest text-foreground">
                  ADMIN_ACCESS
                </Dialog.Title>
                <Dialog.Description className="text-[10px] tracking-widest text-muted-foreground uppercase">
                  Terminal authorization required
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Operative Identifier
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL_ADDRESS"
                  className="w-full rounded-md border border-border bg-secondary/50 py-2.5 pl-10 pr-4 text-sm font-medium transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Access Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PASSWORD"
                  className="w-full rounded-md border border-border bg-secondary/50 py-2.5 pl-10 pr-4 text-sm font-medium transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-[10px] tracking-wider text-destructive uppercase">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-xs font-bold tracking-widest text-black transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "INITIALIZE_SESSION"
              )}
            </button>
          </form>

          <p className="text-center text-[9px] tracking-[0.2em] text-muted-foreground uppercase opacity-40">
            Secure Neural Link v2.5 // Encrypted End-to-End
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
