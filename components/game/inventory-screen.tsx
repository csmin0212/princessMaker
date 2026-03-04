
"use client"

import { useGameStore, MATERIALS } from "@/lib/game-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function InventoryScreen() {
  const { inventory, character, useItem, setScreen } = useGameStore()

  const statLabels: Record<string, string> = {
    strength:"체력",intelligence:"지능",charm:"매력",creativity:"예술",
    morality:"도덕",faith:"신앙",combat:"전투",magic:"마법",cooking:"요리",housework:"가사",health:"HP",stress:"스트레스",
  }

  const totalItems = inventory.reduce((a, i) => a + i.quantity, 0)
  const totalMaterials = character.materials.reduce((a, m) => a + m.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎒</span>
            <div>
              <h1 className="text-2xl font-serif font-bold">인벤토리</h1>
              <p className="text-muted-foreground text-sm">아이템 {totalItems}개 · 재료 {totalMaterials}개</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setScreen("game")}>돌아가기</Button>
        </div>

        <Tabs defaultValue="items">
          <TabsList className="mb-4">
            <TabsTrigger value="items">🧪 아이템 ({totalItems})</TabsTrigger>
            <TabsTrigger value="materials">💎 재료 ({totalMaterials})</TabsTrigger>
          </TabsList>

          <TabsContent value="items">
            {inventory.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <span className="text-6xl mb-4 block">📦</span>
                <h2 className="text-xl font-semibold mb-2">아이템이 없습니다</h2>
                <p className="text-muted-foreground mb-4">상점에서 아이템을 구매하세요!</p>
                <Button onClick={() => setScreen("shop")}>상점 가기</Button>
              </CardContent></Card>
            ) : (
              <ScrollArea className="h-[calc(100vh-260px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inventory.map(item => (
                    <Card key={item.id} className="border-2 hover:border-primary/50 hover:shadow-md transition-all">
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
                                <span key={key} className={cn(
                                  "text-xs px-2 py-0.5 rounded-full font-medium",
                                  (value ?? 0) > 0 || (key === "stress" && (value ?? 0) < 0)
                                    ? "bg-accent/20 text-accent-foreground"
                                    : "bg-destructive/20 text-destructive"
                                )}>
                                  {statLabels[key]} {(value ?? 0) > 0 ? "+" : ""}{value}
                                </span>
                              ))}
                            </div>
                            <Button size="sm" onClick={() => useItem(item.id)} className="w-full">
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
          </TabsContent>

          <TabsContent value="materials">
            {character.materials.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <span className="text-6xl mb-4 block">💎</span>
                <h2 className="text-xl font-semibold mb-2">재료가 없습니다</h2>
                <p className="text-muted-foreground mb-4">던전에서 적을 처치하면 재료를 얻을 수 있습니다</p>
                <Button onClick={() => setScreen("dungeon-select")}>던전 가기</Button>
              </CardContent></Card>
            ) : (
              <ScrollArea className="h-[calc(100vh-260px)]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {character.materials.filter(m => m.quantity > 0).map(m => {
                    const mat = MATERIALS.find(x => x.id === m.id)
                    return (
                      <Card key={m.id} className="border hover:border-primary/50 transition-all">
                        <CardContent className="p-4 text-center">
                          <div className="text-4xl mb-2">{mat?.icon || "💎"}</div>
                          <div className="font-medium text-sm">{mat?.name || m.id}</div>
                          <div className="text-muted-foreground text-xs mt-1">×{m.quantity}</div>
                          {mat?.dropFrom && (
                            <div className="text-xs text-muted-foreground/60 mt-1">
                              {mat.dropFrom} 드롭
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
