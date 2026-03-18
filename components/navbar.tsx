"use client"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookMarked, LogOut, User, Settings, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface NavbarProps {
  userEmail?: string | null
}

export function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center">
            <Bookmark className="w-3.5 h-3.5 text-white/70" />
          </div>
          <span className="text-sm font-semibold text-white/80 tracking-tight hidden sm:block">
            Visual Bookmark
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {userEmail ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="w-3 h-3 text-white/50" />
                  </div>
                  <span className="hidden sm:block text-xs text-white/50 max-w-[140px] truncate">
                    {userEmail}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-white/60 text-xs truncate">{userEmail}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-400 hover:text-red-300 hover:bg-red-500/8">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" variant="secondary">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
