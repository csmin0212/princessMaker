"use client"

import { useGameStore, Stats } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AdventureScreen() {
  const { currentEvent, character, resolveEvent, setScreen } = useGameStore()
  
  if (!currentEvent) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <span className="text-6xl mb-4 block">🌲</span>
            <h2 className="text-xl font-serif font-bold mb-2">이벤트 없음</h2>
            <p className="text-muted-foreground mb-4">현재 진행 중인 이벤트가 없습니다.</p>
            <Button onClick={() => setScreen('game')}>돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
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
  
  const meetsRequirements = (requirements?: Partial<Stats>) => {
    if (!requirements) return true
    for (const [stat, value] of Object.entries(requirements)) {
      if ((character.stats[stat as keyof Stats] || 0) < (value || 0)) {
        return false
      }
    }
    return true
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="text-center border-b border-border/50 bg-card/50">
            <div className="text-6xl mb-4">🗺️</div>
            <CardTitle className="text-2xl font-serif">{currentEvent.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {currentEvent.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg text-center mb-4">어떻게 하시겠습니까?</h3>
            
            <div className="space-y-3">
              {currentEvent.choices.map((choice, index) => {
                const canChoose = meetsRequirements(choice.requirements)
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={cn(
                      "w-full h-auto p-4 text-left flex flex-col items-start gap-2 transition-all",
                      canChoose 
                        ? "hover:bg-primary/10 hover:border-primary/50" 
                        : "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => canChoose && resolveEvent(index)}
                    disabled={!canChoose}
                  >
                    <span className="font-medium">{choice.text}</span>
                    
                    {choice.requirements && (
                      <span className="text-xs text-muted-foreground">
                        필요: {Object.entries(choice.requirements).map(([stat, value]) => (
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
                      </span>
                    )}
                  </Button>
                )
              })}
            </div>
            
            <div className="pt-4 text-center">
              <Button variant="ghost" onClick={() => setScreen('game')}>
                돌아가기 (이벤트 취소)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
