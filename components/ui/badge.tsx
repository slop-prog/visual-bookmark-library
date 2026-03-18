import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "blue"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        variant === "default" && "bg-white/6 text-white/50 ring-white/8",
        variant === "secondary" && "bg-white/4 text-white/40 ring-white/6",
        variant === "blue" && "bg-blue-500/10 text-blue-400 ring-blue-500/20",
        className
      )}
      {...props}
    />
  )
}
