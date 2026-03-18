"use client"
import React, { useState, useEffect } from "react"
import { Loader2, Plus, Tag, X, Link } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getMicrolinkMeta, getDomain } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Bookmark } from "@/lib/types"

interface AddBookmarkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultUrl?: string
  onSuccess?: (bookmark: Bookmark) => void
}

export function AddBookmarkModal({ open, onOpenChange, defaultUrl = "", onSuccess }: AddBookmarkModalProps) {
  const [url, setUrl] = useState(defaultUrl)
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingMeta, setFetchingMeta] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      setUrl(defaultUrl)
      setTags([])
      setTagInput("")
    }
  }, [open, defaultUrl])

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/\s+/g, "-")
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
    }
    setTagInput("")
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    let finalUrl = url.trim()
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast({ title: "Not signed in", variant: "destructive" }); return }

      // Fetch meta via Microlink
      setFetchingMeta(true)
      let title: string | null = null
      let image: string | null = null

      try {
        const res = await fetch(getMicrolinkMeta(finalUrl))
        const data = await res.json()
        if (data.status === "success") {
          title = data.data?.title || null
          image = data.data?.screenshot?.url || null
        }
      } catch {}
      setFetchingMeta(false)

      const domain = getDomain(finalUrl)
      const { data: bookmark, error } = await supabase
        .from("bookmarks")
        .insert({
          url: finalUrl,
          title: title || domain,
          image,
          tags: tags.length > 0 ? tags : [],
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      toast({ title: "Bookmark saved", description: domain })
      onSuccess?.(bookmark)
      onOpenChange(false)
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
      setFetchingMeta(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white/8 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-white/70" />
            </div>
            Add bookmark
          </DialogTitle>
          <DialogDescription>Save a URL to your visual library</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="url">URL</Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="pl-8"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags <span className="text-white/20">(optional)</span></Label>
            <div className="min-h-9 flex flex-wrap gap-1.5 items-center px-3 py-2 rounded-lg border border-white/8 bg-white/4 focus-within:border-white/20 transition-colors">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/8 text-xs text-white/60 font-mono"
                >
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="text-white/30 hover:text-white/60">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <input
                id="tags"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                placeholder={tags.length === 0 ? "design, tools, reference…" : ""}
                className="flex-1 min-w-[80px] bg-transparent text-sm text-white/70 placeholder:text-white/20 outline-none"
              />
            </div>
            <p className="text-[11px] text-white/25">Press Enter or comma to add tags</p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || !url.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {fetchingMeta ? "Fetching preview…" : "Saving…"}
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Save bookmark
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
