"use client"
import React, { useState } from "react"
import { Bookmark, Mail, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError("Email is required"); return }
    setLoading(true); setError("")
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (authError) setError(authError.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'#0a0a0a'}}>
      <div className="fixed inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse 600px 400px at 50% 20%, rgba(59,130,246,0.04) 0%, transparent 70%)'}} />
      <div className="w-full max-w-[360px] relative">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{background:'#111',borderColor:'rgba(255,255,255,0.1)'}}>
            <Bookmark className="w-6 h-6" style={{color:'rgba(255,255,255,0.7)'}} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold" style={{color:'#ededed'}}>Marks</h1>
            <p className="text-sm mt-1" style={{color:'rgba(255,255,255,0.4)'}}>Your visual bookmark library</p>
          </div>
        </div>
        <div className="rounded-2xl p-6 border" style={{background:'#111111',borderColor:'rgba(255,255,255,0.07)'}}>
          {!sent ? (
            <>
              <div className="mb-5">
                <h2 className="text-base font-semibold" style={{color:'#ededed'}}>Sign in</h2>
                <p className="text-sm mt-1" style={{color:'rgba(255,255,255,0.4)'}}>We&apos;ll send a magic link to your email</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{color:'rgba(255,255,255,0.25)'}} />
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} className="pl-9" autoFocus />
                  </div>
                </div>
                {error && <p className="text-xs px-3 py-2 rounded-lg" style={{color:'#f87171',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)'}}>{error}</p>}
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  {loading ? "Sending…" : "Continue with Email"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="flex justify-center"><CheckCircle2 className="w-10 h-10" style={{color:'#4ade80'}} /></div>
              <div>
                <p className="font-medium" style={{color:'#ededed'}}>Check your inbox</p>
                <p className="text-sm mt-1" style={{color:'rgba(255,255,255,0.4)'}}>Magic link sent to <span style={{color:'rgba(255,255,255,0.7)'}}>{email}</span></p>
              </div>
              <button onClick={()=>setSent(false)} className="text-xs" style={{color:'rgba(255,255,255,0.3)'}}>Try a different email</button>
            </div>
          )}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[{icon:"🎨",label:"Visual cards"},{icon:"⚡",label:"Instant save"},{icon:"📁",label:"Smart groups"}].map(f=>(
            <div key={f.label} className="rounded-xl p-3 text-center border" style={{background:'rgba(255,255,255,0.02)',borderColor:'rgba(255,255,255,0.05)'}}>
              <div className="text-lg mb-1">{f.icon}</div>
              <p className="text-[11px]" style={{color:'rgba(255,255,255,0.3)'}}>{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
