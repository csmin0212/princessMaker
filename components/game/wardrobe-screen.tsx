"use client"

import { useGameStore, OUTFITS, Stats } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

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

const rarityColors: Record<string, string> = {
  common: "bg-gray-100 text-gray-700 border-gray-300",
  uncommon: "bg-green-100 text-green-700 border-green-300",
  rare: "bg-blue-100 text-blue-700 border-blue-300",
  legendary: "bg-purple-100 text-purple-700 border-purple-300",
}

const rarityLabels: Record<string, string> = {
  common: "일반",
  uncommon: "고급",
  rare: "희귀",
  legendary: "전설",
}

const categoryLabels: Record<string, string> = {
  daily: "일상복",
  formal: "정장",
  combat: "전투복",
  special: "특수",
}

const OUTFIT_PRICES: Record<string, number> = {
  apron: 50,
  scholar: 150,
  knight: 200,
  "party-dress": 180,
}

export function WardrobeScreen() {
  const { character, gold, setScreen, changeOutfit, buyOutfit } = useGameStore()
  
  const currentOutfit = OUTFITS.find(o => o.id === character.currentOutfit) || OUTFITS[0]
  
  // Separate owned and shop outfits
  const ownedOutfits = OUTFITS.filter(o => character.ownedOutfits.includes(o.id))
  const shopOutfits = OUTFITS.filter(o => 
    !character.ownedOutfits.includes(o.id) && OUTFIT_PRICES[o.id]
  )
  const lockedOutfits = OUTFITS.filter(o => 
    !character.ownedOutfits.includes(o.id) && !OUTFIT_PRICES[o.id]
  )
  
  const handleBuy = (outfitId: string) => {
    const price = OUTFIT_PRICES[outfitId]
    if (price) {
      buyOutfit(outfitId, price)
    }
  }
  
  // Character visual based on personality
  const getCharacterVisual = () => {
    const style = character.personality?.dialogueStyle || "gentle"
    const visuals: Record<string, string> = {
      brave: "\u{1F9D2}",
      gentle: "\u{1F467}",
      curious: "\u{1F9D0}",
      mischievous: "\u{1F608}",
      dreamy: "\u{1F31C}",
    }
    return visuals[style] || "\u{1F467}"
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold">옷장</h1>
            <p className="text-muted-foreground text-sm">
              보유 의상: {ownedOutfits.length}/{OUTFITS.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[oklch(0.75_0.15_85)]/20 px-4 py-2 rounded-lg">
              <span className="text-lg font-semibold">&#x1FA99; {gold} G</span>
            </div>
            <Button variant="outline" onClick={() => setScreen("game")}>
              돌아가기
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Character Preview */}
          <Card className="border-2">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">현재 착용</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-6">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center text-6xl">
                  {getCharacterVisual()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-card border-2 flex items-center justify-center text-2xl shadow-lg">
                  {currentOutfit.icon}
                </div>
              </div>
              
              <h3 className="font-bold text-lg">{currentOutfit.name}</h3>
              <Badge className={cn("mt-1", rarityColors[currentOutfit.rarity])}>
                {rarityLabels[currentOutfit.rarity]}
              </Badge>
              
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {currentOutfit.description}
              </p>
              
              {currentOutfit.statBonuses && (
                <div className="flex flex-wrap gap-1 mt-3 justify-center">
                  {Object.entries(currentOutfit.statBonuses).map(([stat, value]) => (
                    <span
                      key={stat}
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        (value ?? 0) > 0 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {statLabels[stat]} {(value ?? 0) > 0 ? "+" : ""}{value}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Outfit Lists */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="owned">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="owned">보유 ({ownedOutfits.length})</TabsTrigger>
                <TabsTrigger value="shop">상점 ({shopOutfits.length})</TabsTrigger>
                <TabsTrigger value="locked">미획득 ({lockedOutfits.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="owned">
                <Card>
                  <CardContent className="p-4">
                    <ScrollArea className="h-[400px]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ownedOutfits.map(outfit => (
                          <Card 
                            key={outfit.id}
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-md",
                              character.currentOutfit === outfit.id 
                                ? "border-2 border-primary" 
                                : "hover:border-primary/50"
                            )}
                            onClick={() => changeOutfit(outfit.id)}
                          >
                            <CardContent className="p-3 flex items-center gap-3">
                              <div className="text-3xl">{outfit.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">{outfit.name}</span>
                                  <Badge className={cn("text-xs", rarityColors[outfit.rarity])}>
                                    {rarityLabels[outfit.rarity]}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {outfit.description}
                                </p>
                                {outfit.statBonuses && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {Object.entries(outfit.statBonuses).slice(0, 2).map(([stat, value]) => (
                                      <span key={stat} className="text-xs text-green-600">
                                        {statLabels[stat]}+{value}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {character.currentOutfit === outfit.id && (
                                <Badge variant="secondary">착용중</Badge>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="shop">
                <Card>
                  <CardContent className="p-4">
                    <ScrollArea className="h-[400px]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {shopOutfits.map(outfit => {
                          const price = OUTFIT_PRICES[outfit.id]
                          const canAfford = gold >= price
                          
                          return (
                            <Card 
                              key={outfit.id}
                              className={cn(
                                "transition-all",
                                canAfford ? "hover:shadow-md" : "opacity-60"
                              )}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="text-3xl">{outfit.icon}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium truncate">{outfit.name}</span>
                                      <Badge className={cn("text-xs", rarityColors[outfit.rarity])}>
                                        {rarityLabels[outfit.rarity]}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {outfit.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                  <span className="font-bold text-[oklch(0.55_0.15_45)]">
                                    &#x1FA99; {price}G
                                  </span>
                                  <Button 
                                    size="sm"
                                    disabled={!canAfford}
                                    onClick={() => handleBuy(outfit.id)}
                                  >
                                    구매
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                        {shopOutfits.length === 0 && (
                          <div className="col-span-2 text-center py-8 text-muted-foreground">
                            구매 가능한 의상이 없습니다.
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="locked">
                <Card>
                  <CardContent className="p-4">
                    <ScrollArea className="h-[400px]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {lockedOutfits.map(outfit => (
                          <Card key={outfit.id} className="opacity-60">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="text-3xl grayscale">&#x2753;</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium truncate">{outfit.name}</span>
                                    <Badge className={cn("text-xs", rarityColors[outfit.rarity])}>
                                      {rarityLabels[outfit.rarity]}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    획득 조건: {outfit.obtainMethod}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
