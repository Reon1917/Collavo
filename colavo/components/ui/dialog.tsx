"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {},
})

function Dialog({
  open,
  onOpenChange,
  children,
}: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  
  const handleOpenChange = React.useCallback((value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value)
    }
    onOpenChange?.(value)
  }, [isControlled, onOpenChange])
  
  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({ children, asChild = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { onOpenChange } = React.useContext(DialogContext)
  
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: () => onOpenChange(true),
      ...props
    })
  }
  
  return (
    <button 
      type="button"
      onClick={() => onOpenChange(true)}
      data-slot="dialog-trigger"
      {...props}
    >
      {children}
    </button>
  )
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  if (typeof window !== 'undefined') {
    const portalRoot = document.body
    return createPortal(children, portalRoot)
  }

  return null
}

function DialogClose({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = React.useContext(DialogContext)
  
  return (
    <button 
      type="button"
      onClick={() => onOpenChange(false)}
      data-slot="dialog-close"
      {...props}
    >
      {children}
    </button>
  )
}


function DialogContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open, onOpenChange } = React.useContext(DialogContext)
  
  // Handle escape key and body scroll - MUST be before early return
  React.useEffect(() => {
    // Add keyboard listener when dialog opens
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    }
    
    if (open) {
      document.addEventListener("keydown", handleEscapeKey)
      // Prevent scrolling on body
      document.body.style.overflow = "hidden"
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
      document.body.style.overflow = ""
    }
  }, [open, onOpenChange])

  // Early return if dialog is not open
  if (!open) return null

  // Handle click outside
  const handleBackdropClick = () => {
    onOpenChange(false)
  }
  
  // Prevent clicks on the content from closing the dialog
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onOpenChange(false)
    }
  }
  
  return (
    <DialogPortal>
      <div 
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
        style={{ pointerEvents: 'auto' }}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <div
          data-slot="dialog-content"
          className={cn(
            "bg-background animate-in fade-in-0 zoom-in-95 relative z-50 grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg cursor-default",
            className
          )}
          style={{ pointerEvents: 'auto' }}
          onClick={handleContentClick}
          {...props}
        >
          {children}
          <button
            onClick={() => onOpenChange(false)}
            className="ring-offset-background absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
