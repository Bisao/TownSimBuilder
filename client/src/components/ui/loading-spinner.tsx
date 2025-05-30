
import * as React from "react"
import { cn } from "@/lib/utils"

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "primary" | "white"
  text?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", variant = "default", text, ...props }, ref) => {
    const sizes = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12"
    }

    const variants = {
      default: "border-gray-200 border-t-gray-600",
      primary: "border-primary/20 border-t-primary",
      white: "border-white/20 border-t-white"
    }

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center space-y-2", className)}
        {...props}
      >
        <div
          className={cn(
            "animate-spin rounded-full border-2",
            sizes[size],
            variants[variant]
          )}
        />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {text}
          </p>
        )}
      </div>
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

export { LoadingSpinner }
