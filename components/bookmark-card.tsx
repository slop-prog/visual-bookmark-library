"use client"
import React, { useState } from "react"
import { ExternalLink, MoreHorizontal, Bookmark, Trash2, Globe } from "lucide-react"
import { getDomain, getMicrolinkScreenshot } from "@/lib/utils"
import { Bookmark as BookmarkType, Group } from "@/lib/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BookmarkCardProps {
  bookmark: BookmarkType
  groups?: Group[]
  bookmarkGroupIds?: string[]
  onDelete?: (id: string) => void
  onAddToGroup?: (bookmarkId: string, groupId: string) => void
  onRemoveFromGroup?: (bookmarkId: string, groupId: string) => void
  style?: React.CSSProperties
}

export function BookmarkCard({
  bookmark,
  groups = [],
  bookmarkGroupIds = [],
  onDelete,
  onAddToGroup,
  onRemoveFromGroup,
  style,
}: BookmarkCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const domain = getDomain(bookmark.url)
  const screenshotUrl = bookmark.image || getMicrolinkScreenshot(bookmark.url)

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-nav]')) return
    window.open(bookmark.url, "_blank", "noopener,noreferrer")
  }

  return (
    <div
      className={cn(
        "group relative rounded-xl overflow-hidden cursor-pointer",
        "border border-white/7 bg-[#111111]",
        "transition-all duration-200 ease-out",
        "hover:border-white/14 hover:shadow-2xl hover:shadow-black/60",
        "hover:-translate-y-0.5 hover:scale-[1.01]",
      )}
      onClick={handleCardClick}
      style={style}
    >
      {/* Browser chrome header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/6 bg-[#0e0e0e]">
        <div className="flex items-center gap-2 min-w-0">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          {/* Domain pill */}
          <div className="flex items-center gap-1.5 bg-white/5 rounded-md px-2 py-0.5 min-w-0">
            <Globe className="w-3 h-3 text-white/30 shrink-0" />
            <span className="text-[11px] font-mono text-white/40 truncate">{domain}</span>
          </div>
        </div>

        <div className="flex items-center gap-1" data-no-nav>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-md text-white/20 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
          </a>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-md text-white/20 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {groups.length > 0 && (
                <>
                  <DropdownMenuLabel>Save to group</DropdownMenuLabel>
                  {groups.map(group => {
                    const inGroup = bookmarkGroupIds.includes(group.id)
                    return (
                      <DropdownMenuItem
                        key={group.id}
                        onClick={() => inGroup
                          ? onRemoveFromGroup?.(bookmark.id, group.id)
                          : onAddToGroup?.(bookmark.id, group.id)
                        }
                      >
                        <Bookmark className={cn("w-3.5 h-3.5", inGroup ? "fill-white/70 text-white/70" : "")} />
                        <span className={inGroup ? "text-white/80" : ""}>{group.name}</span>
                        {inGroup && <span className="ml-auto text-xs text-white/30">✓</span>}
                      </DropdownMenuItem>
                    )
                  })}
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={() => onDelete?.(bookmark.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete bookmark
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Screenshot area */}
      <div className="relative w-full aspect-[16/10] bg-[#0d0d0d] overflow-hidden">
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 shimmer" />
        )}
        {!imgError ? (
          <img
            src={screenshotUrl}
            alt={bookmark.title || domain}
            className={cn(
              "w-full h-full object-cover object-top transition-opacity duration-300",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true) }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Globe className="w-8 h-8 text-white/10" />
            <span className="text-xs text-white/20 font-mono">{domain}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-white/5">
        <p className="text-[12px] font-medium text-white/60 truncate leading-tight">
          {bookmark.title || domain}
        </p>
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {bookmark.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-white/30 font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
