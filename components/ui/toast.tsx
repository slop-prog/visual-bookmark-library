"use client"
import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitive.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn("fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]", className)}
    {...props}
  />
))
ToastViewport.displayName = "ToastViewport"

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & { variant?: "default" | "destructive" }
>(({ className, variant = "default", ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full",
      variant === "default" && "border-white/8 bg-[#1a1a1a] text-white/80",
      variant === "destructive" && "border-red-500/20 bg-red-950/80 text-red-400",
      className
    )}
    {...props}
  />
))
Toast.displayName = "Toast"

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn("font-medium text-white/90 text-sm", className)} {...props} />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description ref={ref} className={cn("text-white/45 text-xs mt-0.5", className)} {...props} />
))
ToastDescription.displayName = "ToastDescription"

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn("text-white/25 hover:text-white/60 transition-colors shrink-0 mt-0.5", className)}
    {...props}
  >
    <X className="h-3.5 w-3.5" />
  </ToastPrimitive.Close>
))
ToastClose.displayName = "ToastClose"

// ─── Simple imperative toast system ────────────────────────────────────────
type ToastData = { title: string; description?: string; variant?: "default" | "destructive" }
type Listener = (data: ToastData) => void
const listeners: Listener[] = []

export function toast(data: ToastData) {
  listeners.forEach(fn => fn(data))
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<(ToastData & { id: string; open: boolean })[]>([])

  React.useEffect(() => {
    const handler: Listener = (data) => {
      const id = Math.random().toString(36).slice(2)
      setToasts(prev => [...prev, { ...data, id, open: true }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 4000)
    }
    listeners.push(handler)
    return () => {
      const idx = listeners.indexOf(handler)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(t => (
        <Toast key={t.id} open={t.open} variant={t.variant}>
          <div className="flex-1 min-w-0">
            <ToastTitle>{t.title}</ToastTitle>
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose }
