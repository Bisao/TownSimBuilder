
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center p-8 space-y-4",
          className
        )}
        {...props}
      >
        {icon && (
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
        
        {title && (
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
        )}
        
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        )}
        
        {action && (
          <Button
            onClick={action.onClick}
            variant="outline"
            className="mt-4"
          >
            {action.label}
          </Button>
        )}
        
        {children}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState }
