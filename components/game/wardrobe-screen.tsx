"use client"

import { useGameStore, OUTFITS, WEAPONS, ACCESSORIES, Stats } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const statLabels: Record<string, string> = {
  strength: '체력', intelligence: '지능', charm: '매력', creativity: '예술',
  morality: '도덕', faith: '신앙', combat: '전투', magic: '마법',
  cooking: '요리', housework: '가사',
}

const rarityColors: Record<string, string> = {
  common:    "bg-gray-100 text-gray-700 border-gray-300",
  uncommon:  "bg-green-100 text-green-700 border-green-300",
  rare:      "bg-blue-100 text-blue-700 border-blue-300",
  legendary: "bg-purple-100 text-purple-700 border-purple-300",
}

const rarityLabels: Record<string, string> = {
  common: "일반", uncommon: "고급", rare: "희귀", legendary: "전설",
}

export function WardrobeScreen() {
  const {
    character, gold, setScreen, changeOutfit,
    equipWeapon, equipAccessory, unequipAccessory,
    prevScreen,
  } = useGameStore()

  const currentOutfit = OUTFITS.find(o => o.id === character.currentOutfit) || OUTFITS[0]
  const equippedWeapon = WEAPONS.find(w => w.id === character.equippedWeapon)

  const ownedOutfits  = OUTFITS.filter(o => character.ownedOutfits.includes(o.id))
  const lockedOutfits = OUTFITS.filter(o => !character.ownedOutfits.includes(o.id))
  const ownedWeapons  = WEAPONS.filter(w => character.ownedWeapons.includes(w.id))

  const getCharacterVisual = () => {
    const visuals: Record<string, string> = {
      brave: "🧒", gentle: "👧", curious: "🧐", mischievous: "😈", dreamy: "🌙",
    }
    return visuals[character.personality?.dialogueStyle || "gentle"] || "👧"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold">옷장</h1>
            <p className="text-muted-foreground text-sm">보유 의상: {ownedOutfits.length}/{OUTFITS.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-lg">
              <span className="text-lg font-semibold">🪙 {gold} G</span>
            </div>
            <Button variant="outline" onClick={() => setScreen(prevScreen as any)}>돌아가기</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 캐릭터 미리보기 */}
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
              <p className="text-sm text-muted-foreground mt-2 text-center">{currentOutfit.description}</p>
              {currentOutfit.statBonuses && (
                <div className="flex flex-wrap gap-1 mt-3 justify-center">
                  {Object.entries(currentOutfit.statBonuses).map(([stat, value]) => (
                    <span key={stat} className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      (value ?? 0) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {statLabels[stat]} {(value ?? 0) > 0 ? "+" : ""}{value}
                    </span>
                  ))}
                </div>
              )}

              {/* 장착 무기 */}
              <div className="mt-4 w-full border-t pt-3">
                <div className="text-xs text-muted-foreground mb-1">장착 무기</div>
                {equippedWeapon ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{equippedWeapon.icon}</span>
                    <span className="text-sm font-medium">{equippedWeapon.name}</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">없음</p>
                )}
              </div>

              {/* 장착 장신구 */}
              <div className="mt-3 w-full">
                <div className="text-xs text-muted-foreground mb-1">
                  장신구 ({(character.equippedAccessories ?? []).length}/2)
                </div>
                {(character.equippedAccessories ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">없음</p>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {(character.equippedAccessories ?? []).map(id => {
                      const acc = ACCESSORIES.find(a => a.id === id)
                      return acc ? (
                        <span key={id} className="text-xl" title={acc.name}>{acc.icon}</span>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 탭 패널 */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="outfit">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="outfit">👗 의상</TabsTrigger>
                <TabsTrigger value="weapon">⚔️ 무기</TabsTrigger>
                <TabsTrigger value="accessory">💍 장신구</TabsTrigger>
              </TabsList>

              {/* 의상 탭 */}
              <TabsContent value="outfit">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-3">클릭해서 착용하세요</p>
                    <ScrollArea className="h-[420px]">
                      <div className="space-y-4 pr-2">
                        {/* 보유 */}
                        <div>
                          <div className="text-xs font-bold text-muted-foreground mb-2">보유 중</div>
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
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className="font-medium text-sm truncate">{outfit.name}</span>
                                      <Badge className={cn("text-xs border", rarityColors[outfit.rarity])}>
                                        {rarityLabels[outfit.rarity]}
                                      </Badge>
                                    </div>
                                    {outfit.statBonuses && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {Object.entries(outfit.statBonuses).map(([stat, value]) => (
                                          <span key={stat} className="text-xs text-green-600">
                                            {statLabels[stat]}+{value}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {character.currentOutfit === outfit.id && (
                                    <Badge variant="secondary" className="shrink-0">착용중</Badge>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* 미획득 */}
                        {lockedOutfits.length > 0 && (
                          <div>
                            <div className="text-xs font-bold text-muted-foreground mb-2">미획득</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {lockedOutfits.map(outfit => (
                                <Card key={outfit.id} className="opacity-60">
                                  <CardContent className="p-3 flex items-center gap-3">
                                    <div className="text-3xl grayscale">❓</div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1 flex-wrap">
                                        <span className="font-medium text-sm">{outfit.name}</span>
                                        <Badge className={cn("text-xs border", rarityColors[outfit.rarity])}>
                                          {rarityLabels[outfit.rarity]}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        획득 조건: {outfit.obtainMethod}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 무기 탭 */}
              <TabsContent value="weapon">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-3">클릭해서 장착. 무기 구매는 상점에서.</p>
                    <ScrollArea className="h-[420px]">
                      {ownedWeapons.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-8 text-center">
                          보유한 무기가 없습니다. 상점(⚔️ 무기 탭)에서 구매하거나 제작하세요.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-2">
                          {ownedWeapons.map(weapon => {
                            const isEquipped = character.equippedWeapon === weapon.id
                            return (
                              <Card
                                key={weapon.id}
                                className={cn(
                                  "cursor-pointer transition-all hover:shadow-md",
                                  isEquipped ? "border-2 border-primary" : "hover:border-primary/50"
                                )}
                                onClick={() => equipWeapon(weapon.id)}
                              >
                                <CardContent className="p-3 flex items-center gap-3">
                                  <span className="text-3xl">{weapon.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className="font-medium text-sm">{weapon.name}</span>
                                      <Badge className={cn("text-xs border", rarityColors[weapon.rarity])}>
                                        {rarityLabels[weapon.rarity]}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-2 mt-1 flex-wrap">
                                      {weapon.attackBonus > 0 && (
                                        <span className="text-xs text-orange-600">공격 +{weapon.attackBonus}</span>
                                      )}
                                      {weapon.magicAttackBonus > 0 && (
                                        <span className="text-xs text-purple-600">마법 +{weapon.magicAttackBonus}</span>
                                      )}
                                      {weapon.critChance && (
                                        <span className="text-xs text-red-600">
                                          치명타 +{Math.round(weapon.critChance * 100)}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {isEquipped && <Badge variant="secondary" className="shrink-0">장착중</Badge>}
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 장신구 탭 */}
              <TabsContent value="accessory">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-3">
                      최대 2개 장착. 장신구 구매는 상점에서.
                      현재 {(character.equippedAccessories ?? []).length}/2 장착 중.
                    </p>
                    <ScrollArea className="h-[420px]">
                      {(!character.ownedAccessories || character.ownedAccessories.length === 0) ? (
                        <p className="text-sm text-muted-foreground py-8 text-center">
                          보유한 장신구가 없습니다. 상점(💍 장신구 탭)에서 구매하세요.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-2">
                          {(character.ownedAccessories ?? []).map(id => {
                            const acc = ACCESSORIES.find(a => a.id === id)
                            if (!acc) return null
                            const isEquipped = (character.equippedAccessories ?? []).includes(id)
                            const canEquip = !isEquipped && (character.equippedAccessories ?? []).length < 2
                            const effectDesc = Object.entries(acc.effect).map(([k, v]) => {
                              if (k === "critChance")     return `치명타 +${Math.round((v as number) * 100)}%`
                              if (k === "goldMultiplier") return `골드 +${Math.round((v as number) * 100)}%`
                              if (k === "stressReduce")   return `스트레스 감소 +${Math.round((v as number) * 100)}%`
                              if (k === "xpBonus")        return `경험치 +${Math.round((v as number) * 100)}%`
                              const labels: Record<string, string> = {
                                hpBonus: "최대HP", attackBonus: "공격",
                                magicBonus: "마법", defenseBonus: "방어",
                              }
                              return `${labels[k] || k} +${v}`
                            }).join(" · ")
                            return (
                              <Card
                                key={id}
                                className={cn(
                                  "transition-all",
                                  isEquipped ? "border-2 border-primary bg-primary/5" : "border-border"
                                )}
                              >
                                <CardContent className="p-3 flex items-center gap-3">
                                  <span className="text-2xl">{acc.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className="font-medium text-sm">{acc.name}</span>
                                      <Badge className={cn("text-xs border", rarityColors[acc.rarity])}>
                                        {rarityLabels[acc.rarity]}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{effectDesc}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant={isEquipped ? "destructive" : "default"}
                                    disabled={!isEquipped && !canEquip}
                                    onClick={() => isEquipped ? unequipAccessory(id) : equipAccessory(id)}
                                    className="h-7 text-xs px-2 shrink-0"
                                  >
                                    {isEquipped ? "해제" : canEquip ? "장착" : "가득참"}
                                  </Button>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      )}
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
