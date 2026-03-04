
"use client"

import { useState } from "react"
import { useGameStore, DUNGEONS, WEAPONS } from "@/lib/game-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const MAX_POTIONS = 5

export function DungeonPrepScreen() {
  const { dungeon, character, gold, inventory, setPotionSlots, startDungeon, setScreen } = useGameStore()
  const [selectedPotions, setSelectedPotions] = useState<string[]>(dungeon.potionSlots)

  const dungeonDef = DUNGEONS.find(d => d.id === dungeon.currentDungeonId)
  const equippedWeapon = WEAPONS.find(w => w.id === character.equippedWeapon)

  // 포션 가능 아이템 (health 또는 stress 효과 있는 것)
  const potionItems = inventory.filter(i =>
    i.quantity > 0 && (i.effect.health || i.effect.stress)
  )

  const totalSelected = selectedPotions.length

  const addPotion = (itemId: string) => {
    if (totalSelected >= MAX_POTIONS) return
    const inInventory = inventory.find(i => i.id === itemId)
    const alreadyPicked = selectedPotions.filter(p => p === itemId).length
    if (!inInventory || alreadyPicked >= inInventory.quantity) return
    setSelectedPotions([...selectedPotions, itemId])
  }

  const removePotion = (idx: number) => {
    const next = [...selectedPotions]
    next.splice(idx, 1)
    setSelectedPotions(next)
  }

  const handleStart = () => {
    setPotionSlots(selectedPotions)
    startDungeon()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-lg w-full space-y-5">
        <div className="text-center">
          <div className="text-4xl mb-2">{dungeonDef?.icon}</div>
          <h1 className="text-2xl font-serif font-bold text-slate-100">{dungeonDef?.name}</h1>
          <p className="text-slate-400 text-sm mt-1">{dungeonDef?.description}</p>
        </div>

        {/* 장착 무기 */}
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-300 text-sm font-medium mb-1">장착 무기</div>
                {equippedWeapon ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{equippedWeapon.icon}</span>
                    <div>
                      <div className="text-slate-100 font-medium">{equippedWeapon.name}</div>
                      <div className="text-xs text-slate-400">
                        공격 +{equippedWeapon.attackBonus} / 마법 +{equippedWeapon.magicAttackBonus}
                        {equippedWeapon.critChance && <span className="ml-1 text-yellow-400">/ 치명타 +{Math.round(equippedWeapon.critChance*100)}%</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm">없음 — 맨손으로 싸웁니다</div>
                )}
              </div>
              <Button size="sm" variant="outline"
                className="border-slate-600 text-slate-300 bg-transparent text-xs"
                onClick={() => setScreen("wardrobe")}>
                변경
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 포션 선택 */}
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-slate-300 text-sm font-medium">지참 포션 ({totalSelected}/{MAX_POTIONS})</div>
              <Badge className={cn("text-xs", totalSelected >= MAX_POTIONS ? "bg-orange-700" : "bg-slate-700")}>
                최대 {MAX_POTIONS}개
              </Badge>
            </div>

            {/* 선택된 포션 슬롯 */}
            <div className="flex gap-2 flex-wrap min-h-[40px]">
              {selectedPotions.map((itemId, idx) => {
                const item = inventory.find(i => i.id === itemId)
                return (
                  <button key={idx} onClick={() => removePotion(idx)}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-700 rounded-lg border border-slate-600 text-slate-200 text-sm hover:bg-red-900/50 hover:border-red-600 transition-all">
                    <span>{item?.icon}</span>
                    <span className="text-xs">{item?.name}</span>
                    <span className="text-xs text-slate-400">✕</span>
                  </button>
                )
              })}
              {totalSelected === 0 && <span className="text-slate-500 text-sm">포션을 선택하세요</span>}
            </div>

            {/* 포션 목록 */}
            {potionItems.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-500">클릭해서 추가</div>
                {potionItems.map(item => {
                  const picked = selectedPotions.filter(p => p === item.id).length
                  const canAdd = picked < item.quantity && totalSelected < MAX_POTIONS
                  return (
                    <button key={item.id} disabled={!canAdd} onClick={() => addPotion(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-lg border text-left transition-all",
                        canAdd ? "border-slate-600 hover:border-cyan-500 bg-slate-700/50" : "border-slate-700 opacity-40 cursor-not-allowed bg-transparent"
                      )}>
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="text-slate-200 text-sm font-medium">{item.name}</div>
                        <div className="text-slate-400 text-xs">{item.description}</div>
                      </div>
                      <div className="text-slate-400 text-xs">
                        {picked}/{item.quantity}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-slate-500 text-sm">보유한 포션이 없습니다. 상점에서 구매하세요.</div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 border-slate-600 text-slate-300 bg-transparent"
            onClick={() => setScreen("dungeon-select")}>
            ← 돌아가기
          </Button>
          <Button className="flex-1 bg-red-700 hover:bg-red-600 text-white" onClick={handleStart}>
            🗡️ 입장! (-20G)
          </Button>
        </div>
      </div>
    </div>
  )
}
