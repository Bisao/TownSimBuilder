
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  helpText?: string
  variant?: "default" | "filled" | "ghost"
  inputSize?: "sm" | "md" | "lg"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    error, 
    label, 
    helpText, 
    variant = "default", 
    inputSize = "md",
    ...props 
  }, ref) => {
    const variants = {
      default: "border border-input bg-background",
      filled: "border-0 bg-muted",
      ghost: "border-0 bg-transparent border-b border-input rounded-none"
    }

    const sizes = {
      sm: "h-8 px-2 text-xs",
      md: "h-9 px-3 text-sm",
      lg: "h-11 px-4 text-base"
    }

    const inputClasses = cn(
      "flex w-full rounded-md py-1 shadow-sm transition-colors",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      variants[variant],
      sizes[inputSize],
      error && "border-destructive focus-visible:ring-destructive",
      className
    )

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <input
          type={type}
          className={inputClasses}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        {helpText && !error && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
