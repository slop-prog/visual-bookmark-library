"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Compass, Library, Tag, FolderPlus, Loader2, X, Globe, Bookmark } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookmarkGrid } from "@/components/bookmark-grid"
import { SearchInput } from "@/components/search-input"
import { FAB } from "@/components/fab"
import { Navbar } from "@/components/navbar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Bookmark as BookmarkType, Group } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20

export default function HomePage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Explore
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [exploreOffset, setExploreOffset] = useState(0)
  const [exploreHasMore, setExploreHasMore] = useState(false)
  const [exploreLoading, setExploreLoading] = useState(false)

  // Library
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [libraryBookmarks, setLibraryBookmarks] = useState<BookmarkType[]>([])
  const [libraryOffset, setLibraryOffset] = useState(0)
  const [libraryHasMore, setLibraryHasMore] = useState(false)
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [bookmarkGroupMap, setBookmarkGroupMap] = useState<Record<string, string[]>>({})

  const [createGroupOpen, setCreateGroupOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [creatingGroup, setCreatingGroup] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
      setUserId(data.user?.id ?? null)
    })
  }, [])

  // ── Explore load ──────────────────────────────────────────────────
  const doLoadExplore = useCallback(async (uid: string, q: string, tag: string | null, offset: number) => {
    let query = supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)
    if (q) query = query.or(`title.ilike.%${q}%,url.ilike.%${q}%`)
    if (tag) query = query.contains("tags", [tag])
    return query
  }, [])

  useEffect(() => {
    if (!userId) return
    setExploreLoading(true)
    const timer = setTimeout(async () => {
      const { data } = await doLoadExplore(userId, search, activeTag, 0)
      if (data) {
        setBookmarks(data)
        setExploreOffset(data.length)
        setExploreHasMore(data.length === PAGE_SIZE)
      }
      setExploreLoading(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [userId, search, activeTag])

  const loadMoreExplore = useCallback(async () => {
    if (!userId || exploreLoading) return
    setExploreLoading(true)
    const { data } = await doLoadExplore(userId, search, activeTag, exploreOffset)
    if (data) {
      setBookmarks(prev => [...prev, ...data])
      setExploreOffset(prev => prev + data.length)
      setExploreHasMore(data.length === PAGE_SIZE)
    }
    setExploreLoading(false)
  }, [userId, search, activeTag, exploreOffset, exploreLoading])

  // Tags
  useEffect(() => {
    if (!userId) return
    supabase.from("bookmarks").select("tags").eq("user_id", userId).then(({ data }) => {
      if (data) {
        const s = new Set<string>()
        data.forEach(b => (b.tags || []).forEach((t: string) => s.add(t)))
        setAllTags(Array.from(s).sort())
      }
    })
  }, [userId, bookmarks])

  // ── Library load ──────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return
    supabase.from("groups").select("*").eq("user_id", userId).order("created_at").then(({ data }) => {
      if (data) setGroups(data)
    })
  }, [userId])

  const doLoadLibrary = useCallback(async (uid: string, groupId: string | null, offset: number) => {
    if (groupId) {
      const { data: bg } = await supabase.from("bookmark_groups").select("bookmark_id").eq("group_id", groupId)
      const ids = (bg || []).map((r: any) => r.bookmark_id)
      if (!ids.length) return { data: [], noIds: true }
      const { data } = await supabase.from("bookmarks").select("*").in("id", ids).order("created_at", { ascending: false }).range(offset, offset + PAGE_SIZE - 1)
      return { data: data || [] }
    } else {
      const { data } = await supabase.from("bookmarks").select("*").eq("user_id", uid).order("created_at", { ascending: false }).range(offset, offset + PAGE_SIZE - 1)
      return { data: data || [] }
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    setLibraryLoading(true)
    const timer = setTimeout(async () => {
      const { data } = await doLoadLibrary(userId, selectedGroup, 0)
      setLibraryBookmarks(data || [])
      setLibraryOffset((data || []).length)
      setLibraryHasMore((data || []).length === PAGE_SIZE)
      setLibraryLoading(false)
    }, 50)
    return () => clearTimeout(timer)
  }, [userId, selectedGroup])

  const loadMoreLibrary = useCallback(async () => {
    if (!userId || libraryLoading) return
    setLibraryLoading(true)
    const { data } = await doLoadLibrary(userId, selectedGroup, libraryOffset)
    if (data) {
      setLibraryBookmarks(prev => [...prev, ...data])
      setLibraryOffset(prev => prev + data.length)
      setLibraryHasMore(data.length === PAGE_SIZE)
    }
    setLibraryLoading(false)
  }, [userId, selectedGroup, libraryOffset, libraryLoading])

  // Bookmark-group map
  useEffect(() => {
    const allIds = [...new Set([...bookmarks, ...libraryBookmarks].map(b => b.id))]
    if (!allIds.length) return
    supabase.from("bookmark_groups").select("*").in("bookmark_id", allIds).then(({ data }) => {
      if (data) {
        const map: Record<string, string[]> = {}
        data.forEach((bg: any) => {
          if (!map[bg.bookmark_id]) map[bg.bookmark_id] = []
          map[bg.bookmark_id].push(bg.group_id)
        })
        setBookmarkGroupMap(map)
      }
    })
  }, [bookmarks.length, libraryBookmarks.length])

  // ── CRUD ──────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id)
    setBookmarks(b => b.filter(x => x.id !== id))
    setLibraryBookmarks(b => b.filter(x => x.id !== id))
    toast({ title: "Bookmark deleted" })
  }

  const handleAddToGroup = async (bookmarkId: string, groupId: string) => {
    await supabase.from("bookmark_groups").insert({ bookmark_id: bookmarkId, group_id: groupId })
    setBookmarkGroupMap(prev => ({ ...prev, [bookmarkId]: [...(prev[bookmarkId] || []), groupId] }))
    toast({ title: "Added to group" })
  }

  const handleRemoveFromGroup = async (bookmarkId: string, groupId: string) => {
    await supabase.from("bookmark_groups").delete().eq("bookmark_id", bookmarkId).eq("group_id", groupId)
    setBookmarkGroupMap(prev => ({ ...prev, [bookmarkId]: (prev[bookmarkId] || []).filter(id => id !== groupId) }))
    if (selectedGroup === groupId) setLibraryBookmarks(b => b.filter(x => x.id !== bookmarkId))
    toast({ title: "Removed from group" })
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim() || !userId) return
    setCreatingGroup(true)
    const { data, error } = await supabase.from("groups").insert({ name: newGroupName.trim(), user_id: userId }).select().single()
    if (!error && data) { setGroups(g => [...g, data]); toast({ title: "Group created" }) }
    setNewGroupName(""); setCreatingGroup(false); setCreateGroupOpen(false)
  }

  const handleNewBookmark = (bookmark: BookmarkType) => {
    setBookmarks(prev => [bookmark, ...prev])
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userEmail={userEmail} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <Tabs defaultValue="explore">
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <TabsList>
              <TabsTrigger value="explore" className="gap-1.5">
                <Compass className="w-3.5 h-3.5" />Explore
              </TabsTrigger>
              <TabsTrigger value="library" className="gap-1.5">
                <Library className="w-3.5 h-3.5" />Your Library
              </TabsTrigger>
            </TabsList>
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/25">
              <span>Bookmarklet:</span>
              <a
                href={`javascript:(function(){window.open(window.location.origin+'/add?url='+encodeURIComponent(location.href),'_blank','width=480,height=400')})()`}
                className="font-mono bg-white/5 border border-white/8 px-2.5 py-1 rounded-md hover:border-white/18 hover:text-white/50 transition-colors cursor-grab active:cursor-grabbing"
                draggable
                onClick={e => e.preventDefault()}
              >
                📎 Save to Library
              </a>
            </div>
          </div>

          {/* ── EXPLORE ── */}
          <TabsContent value="explore">
            <div className="flex items-start gap-3 mb-6 flex-wrap">
              <SearchInput value={search} onChange={setSearch} />
              {allTags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {allTags.slice(0, 10).map(tag => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono transition-all border",
                        activeTag === tag
                          ? "bg-white/10 border-white/18 text-white/80"
                          : "bg-white/4 border-white/6 text-white/35 hover:border-white/12 hover:text-white/55"
                      )}
                    >
                      <Tag className="w-2.5 h-2.5" />{tag}
                      {activeTag === tag && <X className="w-2.5 h-2.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <BookmarkGrid
              bookmarks={bookmarks}
              groups={groups}
              bookmarkGroupMap={bookmarkGroupMap}
              onDelete={handleDelete}
              onAddToGroup={handleAddToGroup}
              onRemoveFromGroup={handleRemoveFromGroup}
              onLoadMore={loadMoreExplore}
              hasMore={exploreHasMore}
              loading={exploreLoading && bookmarks.length === 0}
              emptyState={
                <EmptyExplore hasSearch={!!(search || activeTag)} />
              }
            />
          </TabsContent>

          {/* ── LIBRARY ── */}
          <TabsContent value="library">
            {userId ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-white/35 uppercase tracking-wider">Groups</span>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-white/35 hover:text-white/60 h-7" onClick={() => setCreateGroupOpen(true)}>
                      <FolderPlus className="w-3.5 h-3.5" />New group
                    </Button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                    {[{ id: null, name: "All bookmarks" }, ...groups].map(g => (
                      <button
                        key={g.id ?? "all"}
                        onClick={() => setSelectedGroup(g.id)}
                        className={cn(
                          "shrink-0 px-3 py-1.5 rounded-lg text-sm transition-all border whitespace-nowrap",
                          selectedGroup === g.id
                            ? "bg-white/10 border-white/16 text-white/80"
                            : "bg-white/4 border-white/6 text-white/38 hover:border-white/12 hover:text-white/60"
                        )}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
                <BookmarkGrid
                  bookmarks={libraryBookmarks}
                  groups={groups}
                  bookmarkGroupMap={bookmarkGroupMap}
                  onDelete={handleDelete}
                  onAddToGroup={handleAddToGroup}
                  onRemoveFromGroup={handleRemoveFromGroup}
                  onLoadMore={loadMoreLibrary}
                  hasMore={libraryHasMore}
                  loading={libraryLoading && libraryBookmarks.length === 0}
                  emptyState={
                    <EmptyLibrary hasGroup={!!selectedGroup} />
                  }
                />
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-32">
                <p className="text-white/40 text-sm">Sign in to view your library</p>
                <Button asChild variant="secondary"><a href="/login">Sign in</a></Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {userId && <FAB onSuccess={handleNewBookmark} />}

      <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <FolderPlus className="w-4 h-4 text-white/50" />Create group
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGroup} className="space-y-4 mt-1">
            <div className="space-y-1.5">
              <Label htmlFor="gname">Name</Label>
              <Input id="gname" placeholder="Design, Dev tools, Reading…" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} autoFocus required />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setCreateGroupOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={creatingGroup || !newGroupName.trim()}>
                {creatingGroup ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyExplore({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center">
        <Globe className="w-5 h-5 text-white/15" />
      </div>
      <p className="text-sm text-white/40">{hasSearch ? "No bookmarks found" : "No bookmarks yet"}</p>
      <p className="text-xs text-white/22 mt-1">{hasSearch ? "Try a different search" : "Click the button below to save your first URL"}</p>
    </div>
  )
}

function EmptyLibrary({ hasGroup }: { hasGroup: boolean }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center">
        <Bookmark className="w-5 h-5 text-white/15" />
      </div>
      <p className="text-sm text-white/40">{hasGroup ? "No bookmarks in this group" : "Library is empty"}</p>
      <p className="text-xs text-white/22 mt-1">{hasGroup ? "Add bookmarks via the card menu" : "Start saving URLs from the Explore tab"}</p>
    </div>
  )
}
