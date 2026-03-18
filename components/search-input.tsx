"use client"
import React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder = "Search bookmarks…", className }: SearchInputProps) {
  return (
    <div className={cn("relative flex-1 max-w-sm", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full h-9 pl-9 pr-8 rounded-lg text-sm",
          "bg-white/5 border border-white/8",
          "text-white/80 placeholder:text-white/25",
          "focus:outline-none focus:border-white/18 focus:bg-white/7",
          "transition-all duration-150"
        )}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
