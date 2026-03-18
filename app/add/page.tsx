"use client"
import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Bookmark, Loader2, ArrowRight, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AddBookmarkModal } from "@/components/add-bookmark-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getMicrolinkMeta, getDomain } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

function AddPageContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const urlParam = params.get("url") || ""
  const [url, setUrl] = useState(urlParam)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    let finalUrl = url.trim()
    if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl

    setLoading(true)
    try {
      if (!user) { router.push(`/login?next=/add?url=${encodeURIComponent(finalUrl)}`); return }

      let title = null, image = null
      try {
        const res = await fetch(getMicrolinkMeta(finalUrl))
        const data = await res.json()
        if (data.status === "success") {
          title = data.data?.title || null
          image = data.data?.screenshot?.url || null
        }
      } catch {}

      const { error } = await supabase.from("bookmarks").insert({
        url: finalUrl, title: title || getDomain(finalUrl), image, tags: [], user_id: user.id,
      })
      if (error) throw error
      setDone(true)
      setTimeout(() => router.push("/"), 1500)
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a]">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center">
            <Bookmark className="w-4 h-4 text-white/60" />
          </div>
          <span className="text-sm font-semibold text-white/70">Visual Bookmark Library</span>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#111] p-6 shadow-2xl">
          {done ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-green-500/12 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-sm font-medium text-white/70">Bookmark saved!</p>
              <p className="text-xs text-white/30 mt-1">Redirecting to library…</p>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <h1 className="text-base font-semibold text-white/80">Save bookmark</h1>
                {urlParam && (
                  <p className="text-xs text-white/35 mt-0.5 truncate font-mono">{getDomain(urlParam)}</p>
                )}
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>URL</Label>
                  <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" required />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => window.close()}>Cancel</Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" />Save</>}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AddPage() {
  return (
    <Suspense>
      <AddPageContent />
    </Suspense>
  )
}
