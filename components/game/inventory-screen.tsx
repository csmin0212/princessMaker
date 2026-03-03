"use client"

import { useGameStore } from "@/lib/game-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function InventoryScreen() {
  const { inventory, useItem, setScreen } = useGameStore()
  
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

  const handleUseItem = (itemId: string) => {
    useItem(itemId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎒</span>
            <div>
              <h1 className="text-2xl font-serif font-bold">인벤토리</h1>
              <p className="text-muted-foreground">보유 아이템: {inventory.reduce((acc, item) => acc + item.quantity, 0)}개</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setScreen('game')}>
            돌아가기
          </Button>
        </div>
        
        {inventory.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <span className="text-6xl mb-4 block">📦</span>
              <h2 className="text-xl font-semibold mb-2">인벤토리가 비어있습니다</h2>
              <p className="text-muted-foreground mb-4">상점에서 아이템을 구매하세요!</p>
              <Button onClick={() => setScreen('shop')}>상점 가기</Button>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventory.map(item => (
                <Card 
                  key={item.id}
                  className="transition-all border-2 hover:border-primary/50 hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <span className="text-4xl">{item.icon}</span>
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {Object.entries(item.effect).map(([key, value]) => (
                            <span 
                              key={key}
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full font-medium",
                                (value ?? 0) > 0 || (key === 'stress' && (value ?? 0) < 0) 
                                  ? "bg-accent/20 text-accent-foreground" 
                                  : "bg-destructive/20 text-destructive"
                              )}
                            >
                              {statLabels[key]} {(value ?? 0) > 0 ? '+' : ''}{value}
                            </span>
                          ))}
                        </div>
                        
                        <Button 
                          size="sm" 
                          onClick={() => handleUseItem(item.id)}
                          className="w-full"
                        >
                          사용하기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
