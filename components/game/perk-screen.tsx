
"use client"

import { useState } from "react"
import { useGameStore, PERKS, LEVEL_XP_TABLE, MAX_PERK_SLOTS, PERK_RESET_COST, PerkCategory } from "@/lib/game-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const TIER_LABEL: Record<number, string> = { 1: "Tier 1", 2: "Tier 2", 3: "Tier 3" }
const TIER_COLOR: Record<number, string> = {
  1: "border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/30",
  2: "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20",
  3: "border-yellow-400 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20",
}

function getPerkTier(perkId: string): number {
  const perk = PERKS.find(p => p.id === perkId)
  if (!perk) return 1
  if (!perk.requires) return 1
  const maxReqTier = Math.max(...perk.requires.map(r => getPerkTier(r)))
  return maxReqTier + 1
}

export function PerkScreen() {
  const { character, gold, setScreen, unlockPerk, resetPerks } = useGameStore()
  const [showReset, setShowReset] = useState(false)
  const [resetResult, setResetResult] = useState<"ok"|"fail"|null>(null)

  const level = character.level
  const currentXP = character.xp
  const xpToNext = level < 10 ? LEVEL_XP_TABLE[level] : 9999
  const xpPrev = level > 1 ? LEVEL_XP_TABLE[level - 1] : 0
  const xpProgress = level < 10 ? ((currentXP - xpPrev) / (xpToNext - xpPrev)) * 100 : 100
  const totalUnlocked = character.unlockedPerks.length
  const remainingSlots = MAX_PERK_SLOTS - totalUnlocked

  const handleReset = () => {
    const ok = resetPerks()
    setResetResult(ok ? "ok" : "fail")
    if (ok) setTimeout(() => { setShowReset(false); setResetResult(null) }, 1000)
  }

  const renderTree = (category: PerkCategory) => {
    const perks = PERKS.filter(p => p.category === category)
    // 티어별 그룹
    const tiers: Record<number, typeof perks> = {}
    for (const p of perks) {
      const t = getPerkTier(p.id)
      if (!tiers[t]) tiers[t] = []
      tiers[t].push(p)
    }

    return (
      <div className="space-y-6">
        {Object.entries(tiers).sort(([a],[b]) => +a - +b).map(([tier, tierPerks]) => (
          <div key={tier}>
            <div className="flex items-center gap-2 mb-3">
              <div className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-full border",
                +tier === 1 ? "border-slate-400 text-slate-600 dark:text-slate-300" :
                +tier === 2 ? "border-blue-500 text-blue-600 dark:text-blue-300" :
                "border-yellow-500 text-yellow-600 dark:text-yellow-300"
              )}>
                {TIER_LABEL[+tier]}
              </div>
              {+tier > 1 && <div className="h-px flex-1 bg-border" />}

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tierPerks.map(perk => {
                const isUnlocked = character.unlockedPerks.includes(perk.id)
                const prereqMet = !perk.requires || perk.requires.every(r => character.unlockedPerks.includes(r))
                const canAfford = character.perkPoints >= perk.cost
                const hasSlot = remainingSlots > 0 || isUnlocked
                const canUnlock = prereqMet && canAfford && hasSlot && !isUnlocked
                const prereqNames = perk.requires?.map(r => PERKS.find(p => p.id === r)?.name).filter(Boolean)

                return (
                  <div key={perk.id} className={cn(
                    "relative rounded-xl border-2 p-4 transition-all",
                    isUnlocked
                      ? "border-primary bg-primary/5 shadow-sm"
                      : prereqMet && hasSlot && canAfford
                        ? cn("cursor-pointer hover:shadow-md", TIER_COLOR[+tier])
                        : "border-dashed border-muted-foreground/30 bg-muted/10 opacity-55"
                  )}>
                    {/* 티어3 특별 마크 */}
                    {+tier === 3 && (
                      <div className="absolute top-2 right-2 text-xs text-yellow-500 font-bold">✦ 최종</div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "text-2xl w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0",
                        isUnlocked ? "bg-primary/20" : "bg-muted"
                      )}>
                        {perk.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={cn("font-bold text-sm", isUnlocked ? "text-primary" : "")}>
                            {perk.name}
                          </span>
                          {isUnlocked && <Badge className="bg-primary text-primary-foreground text-xs px-1">✓</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{perk.description}</p>
                        {!prereqMet && prereqNames && prereqNames.length > 0 && (
                          <p className="text-xs text-orange-500 mt-1">🔒 선행: {prereqNames.join(" + ")}</p>
                        )}
                      </div>
                    </div>

                    {!isUnlocked && (
                      <Button size="sm" disabled={!canUnlock} onClick={() => unlockPerk(perk.id)}
                        className={cn("w-full mt-3 h-7 text-xs",
                          canUnlock ? "bg-primary hover:bg-primary/90" : "opacity-40"
                        )}>
                        {!prereqMet ? "🔒 선행 필요" : !canAfford ? "포인트 부족" : !hasSlot ? `슬롯 없음 (${MAX_PERK_SLOTS}개 한도)` : `습득 (${perk.cost}pt)`}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">⭐</span>
            <div>
              <h1 className="text-2xl font-serif font-bold">특성 트리</h1>
              <p className="text-muted-foreground text-sm">최대 {MAX_PERK_SLOTS}개 습득 가능 · 티어3은 선행 특성 2개 필요</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-red-500 border-red-300 hover:bg-red-50"
              onClick={() => setShowReset(true)}>
              🔄 초기화 ({PERK_RESET_COST}G)
            </Button>
            <Button variant="outline" onClick={() => setScreen("game")}>돌아가기</Button>
          </div>
        </div>

        {/* 레벨 & 포인트 */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">Lv.{level}</div>
                  <div className="text-xs text-muted-foreground">{level < 10 ? "MAX Lv.10" : "✨ MAX"}</div>
                </div>
                <div className="min-w-[160px]">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">경험치</span>
                    <span className="font-medium">{level < 10 ? `${currentXP} / ${xpToNext}` : "MAX"}</span>
                  </div>
                  <Progress value={xpProgress} className="h-2" />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{character.perkPoints}<span className="text-sm text-muted-foreground ml-1">pt</span></div>
                  <div className="text-xs text-muted-foreground">사용 가능</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalUnlocked}<span className="text-sm text-muted-foreground">/{MAX_PERK_SLOTS}</span></div>
                  <div className="text-xs text-muted-foreground">습득한 특성</div>
                </div>
              </div>
            </div>

            {/* 포인트 획득 안내 */}
            <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>📌 레벨업(최대 9번) → 포인트 +1</span>
              <span>📌 던전 최초 클리어(6개) → 포인트 +1</span>
              <span>→ <strong>최대 획득 가능 포인트 15</strong></span>
            </div>

            {remainingSlots === 0 && (
              <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900/30 rounded text-orange-700 dark:text-orange-300 text-xs text-center">
                ⚠️ 슬롯이 가득 찼습니다 ({MAX_PERK_SLOTS}/{MAX_PERK_SLOTS}). 초기화 후 재분배할 수 있습니다.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 트리 탭 */}
        <Tabs defaultValue="combat">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="combat" className="flex-1 gap-1">
              ⚔️ 전투 트리
              <Badge className="text-xs ml-1">
                {PERKS.filter(p => p.category === "combat" && character.unlockedPerks.includes(p.id)).length}
                /{PERKS.filter(p => p.category === "combat").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="life" className="flex-1 gap-1">
              🌿 생활 트리
              <Badge className="text-xs ml-1">
                {PERKS.filter(p => p.category === "life" && character.unlockedPerks.includes(p.id)).length}
                /{PERKS.filter(p => p.category === "life").length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="combat">
            {renderTree("combat")}
          </TabsContent>
          <TabsContent value="life">
            {renderTree("life")}
          </TabsContent>
        </Tabs>
      </div>

      {/* 초기화 다이얼로그 */}
      <Dialog open={showReset} onOpenChange={setShowReset}>
        <DialogContent className="max-w-xs">
          <DialogTitle>🔄 특성 초기화</DialogTitle>
          <DialogDescription>
            모든 특성을 초기화하고 포인트를 되돌립니다.
          </DialogDescription>
          <div className="bg-muted/40 rounded-lg p-4 text-center space-y-1">
            <div className="text-3xl">⚠️</div>
            <p className="font-bold">비용: {PERK_RESET_COST}G</p>
            <p className="text-sm text-muted-foreground">현재 골드: {gold}G</p>
            <p className="text-sm text-muted-foreground">
              {totalUnlocked}개 특성이 초기화되고<br/>포인트 +{totalUnlocked} 반환됩니다
            </p>
          </div>
          {resetResult === "ok" ? (
            <p className="text-center text-green-600 font-medium py-2">✅ 초기화 완료!</p>
          ) : resetResult === "fail" ? (
            <p className="text-center text-red-500 text-sm py-2">골드가 부족합니다</p>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowReset(false)}>취소</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleReset}
                disabled={gold < PERK_RESET_COST}>
                초기화
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
