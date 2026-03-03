"use client"

import { cn } from "@/lib/utils"

interface StatBarProps {
  label: string
  value: number
  maxValue?: number
  color?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  icon?: string
}

export function StatBar({ 
  label, 
  value, 
  maxValue = 200, 
  color = 'bg-primary',
  showValue = true,
  size = 'md',
  icon
}: StatBarProps) {
  const percentage = Math.min(100, (value / maxValue) * 100)
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-foreground/80 font-medium">
          {icon && <span className="text-base">{icon}</span>}
          {label}
        </span>
        {showValue && (
          <span className="text-foreground font-semibold tabular-nums">
            {value}{maxValue !== 200 && `/${maxValue}`}
          </span>
        )}
      </div>
      <div className={cn(
        "w-full bg-muted rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <div 
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
