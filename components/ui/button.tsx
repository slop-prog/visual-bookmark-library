"use client"
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-white/90 active:scale-[0.98]",
        secondary: "bg-white/8 text-white/80 hover:bg-white/12 border border-white/8 hover:border-white/14",
        ghost: "text-white/60 hover:text-white hover:bg-white/6",
        destructive: "bg-red-500/15 text-red-400 hover:bg-red-500/20 border border-red-500/20",
        outline: "border border-white/10 text-white/70 hover:bg-white/6 hover:text-white",
        blue: "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
