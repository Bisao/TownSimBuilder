
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "success" | "warning" | "error"
  indeterminate?: boolean
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size = "md", variant = "default", indeterminate, ...props }, ref) => {
  const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  const variants = {
    default: "border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
    success: "border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white",
    warning: "border-yellow-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-white",
    error: "border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:text-white"
  }

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3.5 w-3.5", 
    lg: "h-4 w-4"
  }

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer shrink-0 rounded-sm border border-primary shadow transition-all",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-0",
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        {indeterminate ? (
          <Minus className={iconSizes[size]} />
        ) : (
          <Check className={iconSizes[size]} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
