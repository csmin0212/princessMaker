"use client"

import { useGameStore, ITEMS } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function ShopScreen() {
  const { gold, buyItem, setScreen } = useGameStore()
  
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
    health: 'HP',
    stress: '스트레스',
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏪</span>
            <div>
              <h1 className="text-2xl font-serif font-bold">상점</h1>
              <p className="text-muted-foreground">아이템을 구매하세요</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[oklch(0.75_0.15_85)]/20 px-4 py-2 rounded-lg">
              <span className="text-lg font-semibold">🪙 {gold} G</span>
            </div>
            <Button variant="outline" onClick={() => setScreen('game')}>
              돌아가기
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ITEMS.map(item => {
              const canAfford = gold >= item.price
              
              return (
                <Card 
                  key={item.id}
                  className={cn(
                    "transition-all border-2",
                    canAfford 
                      ? "hover:border-primary/50 hover:shadow-md" 
                      : "opacity-60"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{item.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {Object.entries(item.effect).map(([key, value]) => (
                            <span 
                              key={key}
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full font-medium",
                                (value ?? 0) > 0 ? "bg-accent/20 text-accent-foreground" : "bg-destructive/20 text-destructive"
                              )}
                            >
                              {statLabels[key]} {(value ?? 0) > 0 ? '+' : ''}{value}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[oklch(0.55_0.15_45)]">
                            🪙 {item.price} G
                          </span>
                          <Button 
                            size="sm" 
                            onClick={() => buyItem(item)}
                            disabled={!canAfford}
                          >
                            구매
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
