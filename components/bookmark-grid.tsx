"use client"
import React, { useEffect, useRef, useCallback } from "react"
import { BookmarkCard } from "@/components/bookmark-card"
import { Bookmark, Group } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BookmarkGridProps {
  bookmarks: Bookmark[]
  groups?: Group[]
  bookmarkGroupMap?: Record<string, string[]>
  onDelete?: (id: string) => void
  onAddToGroup?: (bookmarkId: string, groupId: string) => void
  onRemoveFromGroup?: (bookmarkId: string, groupId: string) => void
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
  emptyState?: React.ReactNode
}

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-white/5 bg-[#111]">
      <div className="h-10 bg-[#0e0e0e] border-b border-white/5 flex items-center px-3 gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full shimmer" />
          <div className="w-2.5 h-2.5 rounded-full shimmer" />
          <div className="w-2.5 h-2.5 rounded-full shimmer" />
        </div>
        <div className="h-4 w-28 rounded-md shimmer" />
      </div>
      <div className="aspect-[16/10] shimmer" />
      <div className="p-3 space-y-1.5">
        <div className="h-3 w-3/4 rounded shimmer" />
        <div className="h-2.5 w-1/3 rounded shimmer" />
      </div>
    </div>
  )
}

export function BookmarkGrid({
  bookmarks,
  groups = [],
  bookmarkGroupMap = {},
  onDelete,
  onAddToGroup,
  onRemoveFromGroup,
  onLoadMore,
  hasMore = false,
  loading = false,
  emptyState,
}: BookmarkGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !loading) {
        onLoadMore?.()
      }
    },
    [hasMore, loading, onLoadMore]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1, rootMargin: "200px" })
    const sentinel = sentinelRef.current
    if (sentinel) observer.observe(sentinel)
    return () => { if (sentinel) observer.unobserve(sentinel) }
  }, [handleObserver])

  if (!loading && bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        {emptyState}
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {bookmarks.map((bookmark, i) => (
          <div
            key={bookmark.id}
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(i % 20, 10) * 30}ms`, animationFillMode: "both" }}
          >
            <BookmarkCard
              bookmark={bookmark}
              groups={groups}
              bookmarkGroupIds={bookmarkGroupMap[bookmark.id] || []}
              onDelete={onDelete}
              onAddToGroup={onAddToGroup}
              onRemoveFromGroup={onRemoveFromGroup}
            />
          </div>
        ))}

        {loading && Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={`sk-${i}`} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-4 mt-4" />
    </div>
  )
}
