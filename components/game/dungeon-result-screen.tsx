"use client"

import { useGameStore, DungeonResult, MATERIALS } from "@/lib/game-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DungeonResultScreen() {
  const { dungeon, setScreen } = useGameStore()
  const result = dungeon.lastResult

  if (!result) {
    setScreen("game")
    return null
  }

  const leveledUp = result.levelAfter > result.levelBefore
  const levelsGained = result.levelAfter - result.levelBefore

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* 헤더 */}
        <div className={cn(
          "rounded-t-2xl p-6 text-center",
          result.success ? "bg-gradient-to-b from-amber-900 to-slate-900" : "bg-gradient-to-b from-red-950 to-slate-900"
        )}>
          <div className="text-5xl mb-3">{result.success ? "🏆" : "💀"}</div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {result.success ? `${result.dungeonName} 클리어!` : "던전에서 쓰러졌습니다"}
          </h1>
          <p className="text-slate-400 text-sm">{result.floors}층 탐험</p>
        </div>

        {/* 보상 박스 */}
        <div className="bg-slate-900 rounded-b-2xl p-6 space-y-4">

          {/* 레벨업 */}
          {leveledUp && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">⬆️</div>
              <p className="text-yellow-400 font-bold text-lg">
                레벨 업! Lv.{result.levelBefore} → Lv.{result.levelAfter}
              </p>
              {levelsGained > 1 && (
                <p className="text-yellow-300 text-sm">+{levelsGained} 레벨 상승!</p>
              )}
              <p className="text-slate-400 text-xs mt-1">특성 포인트 +{levelsGained} 획득</p>
            </div>
          )}

          {/* 골드 & XP */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs mb-1">획득 골드</p>
              <p className="text-amber-400 font-bold text-xl">🪙 {result.goldEarned}G</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs mb-1">획득 경험치</p>
              <p className="text-blue-400 font-bold text-xl">✦ {result.xpEarned} XP</p>
            </div>
          </div>

          {/* 획득 재료 */}
          {result.materials.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-2">획득 재료</p>
              <div className="flex flex-wrap gap-2">
                {result.materials.map((mat, i) => {
                  const def = MATERIALS.find(m => m.id === mat.id)
                  return (
                    <span key={i} className="bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded-lg">
                      {def?.icon || "📦"} {def?.name || mat.id} ×{mat.quantity}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white"
              onClick={() => setScreen("game")}
            >
              🏠 마을로 돌아가기
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => setScreen("dungeon-select")}
            >
              ⚔️ 던전 선택
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
