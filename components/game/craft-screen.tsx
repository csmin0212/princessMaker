"use client"

import { useState } from "react"
import { useGameStore, RECIPES, MATERIALS, WEAPONS, OUTFITS, ITEMS, CRAFTED_ITEMS } from "@/lib/game-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const rarityOrder: Record<string, number> = {
  common: 0, uncommon: 1, rare: 2, legendary: 3,
}
const rarityLabel: Record<string, string> = {
  common: "일반", uncommon: "고급", rare: "희귀", legendary: "전설",
}
const rarityColors: Record<string, string> = {
  common:    "bg-gray-100 text-gray-600 border-gray-200",
  uncommon:  "bg-green-100 text-green-700 border-green-200",
  rare:      "bg-blue-100 text-blue-700 border-blue-200",
  legendary: "bg-purple-100 text-purple-700 border-purple-200",
}
const rarityBorder: Record<string, string> = {
  common:    "border-gray-200",
  uncommon:  "border-green-200",
  rare:      "border-blue-300",
  legendary: "border-purple-300",
}

export function CraftScreen() {
  const { character, inventory, craftRecipe, setScreen } = useGameStore()
  const [craftResult, setCraftResult] = useState<{ name: string; icon: string } | null>(null)

  const getItemName = (id: string) => {
    const allItems = [...ITEMS, ...CRAFTED_ITEMS]
    return inventory.find(i => i.id === id)?.name
      || allItems.find(i => i.id === id)?.name
      || MATERIALS.find(m => m.id === id)?.name
      || WEAPONS.find(w => w.id === id)?.name
      || OUTFITS.find(o => o.id === id)?.name
      || id
  }

  const getItemIcon = (id: string) => {
    const allItems = [...ITEMS, ...CRAFTED_ITEMS]
    return inventory.find(i => i.id === id)?.icon
      || allItems.find(i => i.id === id)?.icon
      || MATERIALS.find(m => m.id === id)?.icon
      || WEAPONS.find(w => w.id === id)?.icon
      || OUTFITS.find(o => o.id === id)?.icon
      || "📦"
  }

  const getHave = (id: string) => {
    const invQty = inventory.find(i => i.id === id)?.quantity || 0
    const matQty = character.materials.find(m => m.id === id)?.quantity || 0
    const weapQty = character.ownedWeapons.includes(id) ? 1 : 0
    return invQty + matQty + weapQty
  }

  const canCraft = (recipeId: string) => {
    const recipe = RECIPES.find(r => r.id === recipeId)
    if (!recipe) return false
    return recipe.ingredients.every(ing => getHave(ing.id) >= ing.quantity)
  }

  const getResultRarity = (recipe: typeof RECIPES[0]): string => {
    if (recipe.resultType === "weapon") return WEAPONS.find(w => w.id === recipe.resultId)?.rarity || "common"
    if (recipe.resultType === "outfit") return OUTFITS.find(o => o.id === recipe.resultId)?.rarity || "common"
    // 아이템은 재료 수/희귀도 기반으로 등급 추정
    const hasRareMat = recipe.ingredients.some(i =>
      ["goddess-tear","divine-feather","world-root","abyss-core","void-shard","dragon-scale","blood-ruby","frost-core","wraith-essence"].includes(i.id)
    )
    const hasLegendaryMat = recipe.ingredients.some(i =>
      ["goddess-tear","abyss-core","elixir-of-life"].includes(i.id)
    )
    if (hasLegendaryMat) return "legendary"
    if (hasRareMat) return "rare"
    return "common"
  }

  const getResultStats = (recipe: typeof RECIPES[0]) => {
    if (recipe.resultType === "weapon") {
      const w = WEAPONS.find(w => w.id === recipe.resultId)
      if (!w) return null
      const parts = []
      if (w.attackBonus) parts.push(`공격 +${w.attackBonus}`)
      if (w.magicAttackBonus) parts.push(`마법 +${w.magicAttackBonus}`)
      if (w.critChance) parts.push(`치명타 +${Math.round(w.critChance * 100)}%`)
      return parts.join(" / ")
    }
    if (recipe.resultType === "outfit") {
      const o = OUTFITS.find(o => o.id === recipe.resultId)
      if (!o?.statBonuses) return null
      return Object.entries(o.statBonuses).map(([k, v]) => {
        const names: Record<string, string> = {
          strength: "체력", intelligence: "지능", charm: "매력",
          creativity: "예술", morality: "도덕", faith: "신앙",
          combat: "전투", magic: "마법", cooking: "요리", housework: "가사",
        }
        return `${names[k] || k} ${(v ?? 0) > 0 ? "+" : ""}${v}`
      }).join(" / ")
    }
    return null
  }

  const handleCraft = (recipeId: string) => {
    const recipe = RECIPES.find(r => r.id === recipeId)
    if (!recipe) return
    const ok = craftRecipe(recipeId)
    if (ok) setCraftResult({ name: recipe.name, icon: recipe.icon })
  }

  const sortedByRarity = (type: string) =>
    RECIPES
      .filter(r => r.resultType === type)
      .sort((a, b) => rarityOrder[getResultRarity(a)] - rarityOrder[getResultRarity(b)])

  const RecipeCard = ({ recipe }: { recipe: typeof RECIPES[0] }) => {
    const craftable = canCraft(recipe.id)
    const rarity = getResultRarity(recipe)
    const stats = getResultStats(recipe)

    return (
      <Card className={cn(
        "border-2 transition-all",
        craftable
          ? cn("hover:shadow-md", rarityBorder[rarity])
          : "border-border opacity-70"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl flex-shrink-0">{recipe.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="font-bold text-sm">{recipe.name}</span>
                <Badge className={cn("text-[10px] px-1.5 border", rarityColors[rarity])}>
                  {rarityLabel[rarity]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{recipe.description}</p>
              {stats && (
                <p className="text-xs text-primary/80 mt-0.5 font-medium">{stats}</p>
              )}
            </div>
          </div>

          {/* 재료 목록 */}
          <div className="space-y-1 mb-3 pl-1">
            {recipe.ingredients.map(ing => {
              const have = getHave(ing.id)
              const ok = have >= ing.quantity
              return (
                <div key={ing.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span>{getItemIcon(ing.id)}</span>
                    <span className={ok ? "text-foreground" : "text-muted-foreground"}>
                      {getItemName(ing.id)}
                    </span>
                  </div>
                  <span className={cn("font-semibold tabular-nums", ok ? "text-green-600" : "text-red-500")}>
                    {have}/{ing.quantity}
                  </span>
                </div>
              )
            })}
          </div>

          <Button
            className="w-full h-8 text-sm"
            disabled={!craftable}
            onClick={() => handleCraft(recipe.id)}
          >
            {craftable ? "⚒️ 제작하기" : "재료 부족"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">⚒️</span>
            <div>
              <h1 className="text-2xl font-serif font-bold">제작</h1>
              <p className="text-muted-foreground text-sm">재료를 조합해 강력한 아이템을 만드세요</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setScreen("game")}>돌아가기</Button>
        </div>

        {/* 보유 재료 */}
        {character.materials.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5 p-3 bg-muted/30 rounded-lg">
            <span className="text-xs font-medium text-muted-foreground w-full">보유 재료:</span>
            {character.materials.filter(m => m.quantity > 0).map(m => {
              const mat = MATERIALS.find(x => x.id === m.id)
              return (
                <span key={m.id} className="flex items-center gap-1 px-2 py-1 bg-background rounded border text-xs">
                  <span>{mat?.icon}</span>
                  <span>{mat?.name}</span>
                  <span className="text-muted-foreground font-semibold">×{m.quantity}</span>
                </span>
              )
            })}
          </div>
        )}

        {/* 제작 성공 토스트 */}
        {craftResult && (
          <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg flex items-center gap-2 text-green-800 text-sm animate-in fade-in">
            <span className="text-xl">{craftResult.icon}</span>
            <span><strong>{craftResult.name}</strong> 제작 완료!</span>
            <Button size="sm" variant="ghost" className="ml-auto h-6 text-green-700" onClick={() => setCraftResult(null)}>✕</Button>
          </div>
        )}

        {/* 유형별 탭 */}
        <Tabs defaultValue="item">
          <TabsList className="grid grid-cols-3 mb-4 h-10">
            <TabsTrigger value="item" className="gap-1.5">
              <span>🧪</span>
              <span>아이템</span>
              <span className="text-xs opacity-60">({sortedByRarity("item").length})</span>
            </TabsTrigger>
            <TabsTrigger value="weapon" className="gap-1.5">
              <span>⚔️</span>
              <span>무기</span>
              <span className="text-xs opacity-60">({sortedByRarity("weapon").length})</span>
            </TabsTrigger>
            <TabsTrigger value="outfit" className="gap-1.5">
              <span>👗</span>
              <span>의상</span>
              <span className="text-xs opacity-60">({sortedByRarity("outfit").length})</span>
            </TabsTrigger>
          </TabsList>

          {(["item", "weapon", "outfit"] as const).map(type => (
            <TabsContent key={type} value={type} className="mt-0">
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-2">
                  {sortedByRarity(type).map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

      </div>
    </div>
  )
}
