"use client"
import React, { useState } from "react"
import { Plus } from "lucide-react"
import { AddBookmarkModal } from "@/components/add-bookmark-modal"
import { Bookmark } from "@/lib/types"

interface FABProps {
  onSuccess?: (bookmark: Bookmark) => void
}

export function FAB({ onSuccess }: FABProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-4 h-11 rounded-full bg-white text-black text-sm font-semibold shadow-xl shadow-black/40 hover:bg-white/90 active:scale-95 transition-all duration-150"
        aria-label="Add bookmark"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        <span>Add bookmark</span>
      </button>
      <AddBookmarkModal open={open} onOpenChange={setOpen} onSuccess={onSuccess} />
    </>
  )
}
