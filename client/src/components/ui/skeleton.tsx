
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "rectangular" | "text"
  animation?: "pulse" | "wave" | "none"
}

function Skeleton({ 
  className, 
  variant = "default", 
  animation = "pulse",
  ...props 
}: SkeletonProps) {
  const variants = {
    default: "rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-none",
    text: "rounded-sm h-4"
  }

  const animations = {
    pulse: "animate-pulse",
    wave: "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]",
    none: ""
  }

  return (
    <div
      className={cn(
        "bg-primary/10",
        variants[variant],
        animations[animation],
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
