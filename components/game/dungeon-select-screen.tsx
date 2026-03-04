
"use client"

import { useState } from "react"
import { useGameStore, DUNGEONS, DungeonId, WEAPONS } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const themeColors: Record<string, string> = {
  nature: "from-green-900 to-green-800 border-green-600",
  ice:    "from-blue-900 to-cyan-800 border-cyan-500",
  blood:  "from-red-900 to-red-800 border-red-600",
  dark:   "from-slate-900 to-slate-800 border-slate-500",
  divine: "from-yellow-900 to-amber-800 border-yellow-400",
  void:   "from-purple-900 to-black border-purple-500",
}

export function DungeonSelectScreen() {
  const { dungeon, character, gold, selectDungeon, setScreen } = useGameStore()
  const [hovered, setHovered] = useState<DungeonId | null>(null)

  const isUnlocked = (d: typeof DUNGEONS[0]) => {
    if (d.id === 'abyss') return character.worldKnowledge >= 50
    if (!d.unlockAfter) return true
    return dungeon.clearedDungeons.includes(d.unlockAfter)
  }

  const isCleared = (id: DungeonId) => dungeon.clearedDungeons.includes(id)

  const equippedWeapon = WEAPONS.find(w => w.id === character.equippedWeapon)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-100">⚔️ 던전 선택</h1>
            <p className="text-slate-400 text-sm mt-1">탐험할 던전을 선택하세요</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">
              {equippedWeapon ? (
                <span>{equippedWeapon.icon} {equippedWeapon.name} 장착중</span>
              ) : (
                <span className="text-slate-500">무기 미장착</span>
              )}
            </div>
            <Button variant="outline" size="sm"
              className="border-slate-600 text-slate-300 bg-transparent"
              onClick={() => setScreen("game")}>
              돌아가기
            </Button>
          </div>
        </div>

        {gold < 20 && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            ⚠️ 던전 입장에는 20G가 필요합니다. 현재 골드: {gold}G
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DUNGEONS.map(d => {
            const unlocked = isUnlocked(d)
            const cleared = isCleared(d.id as DungeonId)
            const canEnter = unlocked && gold >= 20

            return (
              <button
                key={d.id}
                disabled={!canEnter}
                onClick={() => canEnter && selectDungeon(d.id as DungeonId)}
                onMouseEnter={() => setHovered(d.id as DungeonId)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "text-left rounded-xl border-2 bg-gradient-to-br p-5 transition-all",
                  themeColors[d.theme],
                  canEnter ? "hover:scale-[1.02] hover:shadow-xl cursor-pointer" : "opacity-40 cursor-not-allowed"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{unlocked ? d.icon : "🔒"}</span>
                    <div>
                      <div className="font-bold text-slate-100 text-lg">
                        {unlocked ? d.name : "???"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {unlocked ? (d.id === "abyss" ? "∞층" : `${d.floors}층`) : "— 층"}
                        {unlocked && d.worldKnowledgeReward ? ` · 세계의 지식 +${d.worldKnowledgeReward}%` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {cleared && <Badge className="bg-green-600 text-white text-xs">클리어 ✓</Badge>}
                    {!unlocked && <Badge className="bg-slate-700 text-slate-300 text-xs">🔒 잠김</Badge>}
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  {unlocked ? d.description : "???"}
                </p>
                {!unlocked && (
                  <p className="text-xs text-slate-600 mt-2">— 잠긴 던전 —</p>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
