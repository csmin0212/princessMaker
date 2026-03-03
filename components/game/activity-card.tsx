"use client"

import { Activity, useGameStore, Stats } from "@/lib/game-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ActivityCardProps {
  activity: Activity
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { character, gold, doActivity } = useGameStore()
  
  // Check if requirements are met
  const meetsRequirements = () => {
    if (!activity.requirements) return true
    for (const [stat, value] of Object.entries(activity.requirements)) {
      if ((character.stats[stat as keyof Stats] || 0) < (value || 0)) {
        return false
      }
    }
    return true
  }
  
  const canAfford = activity.goldChange >= 0 || gold >= Math.abs(activity.goldChange)
  const isAvailable = meetsRequirements() && canAfford
  
  const statLabels: Record<string, string> = {
    strength: '체력',
    intelligence: '지능',
    charm: '매력',
    creativity: '예술',
    morality: '도덕',
    faith: '신앙',
    combat: '전투',
    magic: '마법',
    cooking: '요리',
    housework: '가사',
  }
  
  return (
    <Card className={cn(
      "transition-all duration-200 border-2",
      isAvailable 
        ? "hover:border-primary/50 hover:shadow-md cursor-pointer" 
        : "opacity-60 border-muted"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{activity.icon}</span>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground">{activity.name}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
            
            {/* Stat changes */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {Object.entries(activity.statChanges).map(([stat, value]) => (
                <span 
                  key={stat}
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    (value ?? 0) > 0 ? "bg-accent/20 text-accent-foreground" : "bg-destructive/20 text-destructive"
                  )}
                >
                  {statLabels[stat]} {(value ?? 0) > 0 ? '+' : ''}{value}
                </span>
              ))}
              {activity.stressChange !== 0 && (
                <span 
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    activity.stressChange < 0 ? "bg-accent/20 text-accent-foreground" : "bg-destructive/20 text-destructive"
                  )}
                >
                  스트레스 {activity.stressChange > 0 ? '+' : ''}{activity.stressChange}
                </span>
              )}
              {activity.goldChange !== 0 && (
                <span 
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    activity.goldChange > 0 ? "bg-[oklch(0.75_0.15_85)]/30 text-foreground" : "bg-destructive/20 text-destructive"
                  )}
                >
                  🪙 {activity.goldChange > 0 ? '+' : ''}{activity.goldChange}
                </span>
              )}
            </div>
            
            {/* Requirements */}
            {activity.requirements && (
              <div className="mt-2 text-xs text-muted-foreground">
                필요: {Object.entries(activity.requirements).map(([stat, value]) => (
                  <span 
                    key={stat}
                    className={cn(
                      "mr-2",
                      (character.stats[stat as keyof Stats] || 0) >= (value || 0) 
                        ? "text-accent" 
                        : "text-destructive"
                    )}
                  >
                    {statLabels[stat]} {value}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={() => doActivity(activity)}
            disabled={!isAvailable}
            className="shrink-0"
          >
            실행
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
