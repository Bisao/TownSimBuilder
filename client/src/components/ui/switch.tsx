
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "success" | "warning" | "error"
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, size = "md", variant = "default", ...props }, ref) => {
  const sizes = {
    sm: "h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
    md: "h-5 w-9 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", 
    lg: "h-6 w-11 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
  }

  const thumbSizes = {
    sm: "h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0",
    md: "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
    lg: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
  }

  const variants = {
    default: "data-[state=checked]:bg-primary",
    success: "data-[state=checked]:bg-green-500",
    warning: "data-[state=checked]:bg-yellow-500",
    error: "data-[state=checked]:bg-red-500"
  }

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform",
          thumbSizes[size]
        )}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
