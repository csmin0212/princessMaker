"use client"

import { useGameStore, OUTFITS } from "@/lib/game-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

export function EventResultModal() {
  const { currentEventResult, clearEventResult } = useGameStore()

  if (!currentEventResult) return null

  const outfit = currentEventResult.outfitReward
    ? OUTFITS.find(o => o.id === currentEventResult.outfitReward)
    : null

  // 의상 획득 시 특별 풀스크린 모달
  if (outfit) {
    return (
      <Dialog open={!!currentEventResult} onOpenChange={() => clearEventResult()}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogTitle className="sr-only">새 의상 획득: {outfit.name}</DialogTitle>
          <DialogDescription className="sr-only">{outfit.description}</DialogDescription>
          {/* 화려한 헤더 */}
          <div className={cn(
            "relative p-8 text-center",
            outfit.rarity === "legendary"
              ? "bg-gradient-to-b from-purple-600 via-purple-500 to-purple-400"
              : outfit.rarity === "rare"
              ? "bg-gradient-to-b from-blue-600 via-blue-500 to-blue-400"
              : outfit.rarity === "uncommon"
              ? "bg-gradient-to-b from-green-600 via-green-500 to-green-400"
              : "bg-gradient-to-b from-gray-500 via-gray-400 to-gray-300"
          )}>
            {/* 반짝이 효과 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {["top-2 left-8", "top-4 right-12", "top-8 left-1/3", "top-1 right-1/4", "top-6 left-1/2"].map((pos, i) => (
                <div key={i} className={`absolute ${pos} text-white/40 text-xl animate-pulse`} style={{ animationDelay: `${i * 0.3}s` }}>✦</div>
              ))}
            </div>
            <div className="relative">
              <p className="text-white/80 text-sm font-semibold tracking-widest uppercase mb-3">✨ 새 의상 획득!</p>
              <div className="text-8xl mb-3 drop-shadow-lg">{outfit.icon}</div>
              <h2 className="text-2xl font-serif font-bold text-white mb-1">{outfit.name}</h2>
              <Badge className={cn("border", rarityColors[outfit.rarity])}>
                {rarityLabels[outfit.rarity]}
              </Badge>
            </div>
          </div>

          {/* 내용 */}
          <div className="p-6 space-y-4">
            {/* 이벤트 설명 */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentEventResult.description}
              </p>
            </div>

            {/* 의상 설명 */}
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-foreground mb-1">{outfit.name}</p>
              <p className="text-xs text-muted-foreground">{outfit.description}</p>
            </div>

            {/* 스탯 보너스 */}
            {outfit.statBonuses && Object.keys(outfit.statBonuses).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground text-center">착용 보너스</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.entries(outfit.statBonuses).map(([stat, value]) => (
                    <span
                      key={stat}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        (value ?? 0) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}
                    >
                      {statLabels[stat]} {(value ?? 0) > 0 ? "+" : ""}{value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 기타 변화 */}
            {(currentEventResult.statChanges || currentEventResult.goldChange) && (
              <div className="flex flex-wrap gap-2 justify-center">
                {currentEventResult.statChanges && Object.entries(currentEventResult.statChanges).map(([stat, value]) => (
                  <span key={stat} className={cn("px-2 py-0.5 rounded-full text-xs font-medium", (value ?? 0) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                    {statLabels[stat]} {(value ?? 0) > 0 ? "+" : ""}{value}
                  </span>
                ))}
                {currentEventResult.goldChange && (
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", currentEventResult.goldChange > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700")}>
                    골드 {currentEventResult.goldChange > 0 ? "+" : ""}{currentEventResult.goldChange}
                  </span>
                )}
              </div>
            )}

            <Button onClick={clearEventResult} className="w-full">
              옷장에서 착용하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // 일반 결과 모달 (기존과 동일)
  const hasChanges =
    currentEventResult.statChanges ||
    currentEventResult.goldChange ||
    currentEventResult.healthChange ||
    currentEventResult.stressChange ||
    currentEventResult.worldKnowledgeChange

  return (
    <Dialog open={!!currentEventResult} onOpenChange={() => clearEventResult()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="text-6xl mb-4 mx-auto">{currentEventResult.icon}</div>
          <DialogTitle className="text-xl font-serif">{currentEventResult.title}</DialogTitle>
          <DialogDescription className="text-base mt-2">
            {currentEventResult.description}
          </DialogDescription>
        </DialogHeader>

        {hasChanges && (
          <div className="space-y-4 py-4">
            {currentEventResult.statChanges && Object.keys(currentEventResult.statChanges).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">능력치 변화</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(currentEventResult.statChanges).map(([stat, value]) => (
                    <span
                      key={stat}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        (value ?? 0) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}
                    >
                      {statLabels[stat]} {(value ?? 0) > 0 ? "+" : ""}{value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {currentEventResult.goldChange && (
                <span className={cn("px-3 py-1 rounded-full text-sm font-medium", currentEventResult.goldChange > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700")}>
                  골드 {currentEventResult.goldChange > 0 ? "+" : ""}{currentEventResult.goldChange}
                </span>
              )}
              {currentEventResult.healthChange && (
                <span className={cn("px-3 py-1 rounded-full text-sm font-medium", currentEventResult.healthChange > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                  HP {currentEventResult.healthChange > 0 ? "+" : ""}{currentEventResult.healthChange}
                </span>
              )}
              {currentEventResult.stressChange && (
                <span className={cn("px-3 py-1 rounded-full text-sm font-medium", currentEventResult.stressChange < 0 ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700")}>
                  스트레스 {currentEventResult.stressChange > 0 ? "+" : ""}{currentEventResult.stressChange}
                </span>
              )}
              {currentEventResult.worldKnowledgeChange && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-700">
                  세계의 이해 +{currentEventResult.worldKnowledgeChange}%
                </span>
              )}
            </div>
          </div>
        )}

        <Button onClick={clearEventResult} className="w-full">
          확인
        </Button>
      </DialogContent>
    </Dialog>
  )
}
