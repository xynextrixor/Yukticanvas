import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "secondary" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[#FF3B30] text-white hover:bg-[#E3261C] shadow-md shadow-red-200": variant === "default",
            "bg-white border border-gray-200 hover:bg-gray-50": variant === "secondary",
            "border border-gray-200 bg-white hover:bg-gray-50": variant === "outline",
            "hover:bg-gray-50": variant === "ghost",
            "px-4 py-1.5": size === "default",
            "px-3 py-1.5 rounded-md": size === "sm",
            "h-10 px-8 text-base": size === "lg",
            "h-8 w-8": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
