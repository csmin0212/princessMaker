
"use client"

import { useGameStore, Stats, WEAPONS, DUNGEONS } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statLabels: Record<string, string> = {
  strength:"체력",intelligence:"지능",charm:"매력",creativity:"예술",
  morality:"도덕",faith:"신앙",combat:"전투",magic:"마법",cooking:"요리",housework:"가사",
}

export function DungeonScreen() {
  const { dungeon, character, inventory, attackEnemy, useMagicAttack, fleeDungeon, resolveDungeonChoice, endDungeon, usePotionInDungeon } = useGameStore()

  const dungeonDef = DUNGEONS.find(d => d.id === dungeon.currentDungeonId)
  const weapon = WEAPONS.find(w => w.id === character.equippedWeapon)

  // 지참 포션 (슬롯에 있고 인벤에 있는 것)
  const availablePotions = dungeon.potionSlots
    .map(id => inventory.find(i => i.id === id))
    .filter(Boolean)

  // 사용한 포션 카운트
  const usedCount = dungeon.usedPotions.length
  const totalSlots = dungeon.potionSlots.length

  const meetsReq = (req?: Partial<Stats> & { worldKnowledge?: number; flag?: string; equippedOutfit?: string; notFlag?: string }) => {
    if (!req) return true
    for (const [k, v] of Object.entries(req)) {
      if (k === "worldKnowledge") { if (character.worldKnowledge < (v||0)) return false }
      else if (k === "flag") { if (!character.storyFlags?.includes(v as string)) return false }
      else if (k === "notFlag") { if (character.storyFlags?.includes(v as string)) return false }
      else if (k === "equippedOutfit") { if (character.currentOutfit !== (v as string)) return false }
      else if ((character.stats[k as keyof Stats]||0) < (v||0)) return false
    }
    return true
  }

  const isAbyss = dungeon.currentDungeonId === "abyss"

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-100 flex items-center gap-2">
              <span>{dungeonDef?.icon}</span> {dungeonDef?.name || "던전"}
            </h1>
            <p className="text-slate-400 text-sm">
              {isAbyss ? `${dungeon.floor}층` : `${dungeon.floor} / ${dungeon.maxFloors}층`}
              {dungeon.maxFloorReached > 0 && ` · 최고 ${dungeon.maxFloorReached}층`}
            </p>
          </div>
          <Button variant="outline" onClick={() => endDungeon(true)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent text-sm">
            🏳️ 탈출
          </Button>
        </div>

        {!isAbyss && (
          <Progress value={(dungeon.floor / dungeon.maxFloors) * 100} className="h-2 bg-slate-700" />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 플레이어 상태 */}
          <Card className="bg-slate-800/80 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                <span>👧</span> {character.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-400">HP</span>
                  <span className="text-slate-300">{dungeon.currentHP} / {dungeon.maxHP}</span>
                </div>
                <Progress value={(dungeon.currentHP / dungeon.maxHP) * 100} className="h-3 bg-slate-700" />
              </div>

              {weapon && (
                <div className="flex items-center gap-2 text-sm">
                  <span>{weapon.icon}</span>
                  <span className="text-slate-300">{weapon.name}</span>
                  <span className="text-orange-400 text-xs">+{weapon.attackBonus}</span>
                  <span className="text-purple-400 text-xs">+{weapon.magicAttackBonus}</span>
                </div>
              )}

              <Separator className="bg-slate-700" />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-400">전투: <span className="text-orange-400">{character.stats.combat}</span></div>
                <div className="text-slate-400">마법: <span className="text-purple-400">{character.stats.magic}</span></div>
                <div className="text-slate-400">체력: <span className="text-green-400">{character.stats.strength}</span></div>
                <div className="text-slate-400">지능: <span className="text-blue-400">{character.stats.intelligence}</span></div>
              </div>

              <Separator className="bg-slate-700" />
              <div className="text-sm text-slate-400">
                획득 골드: <span className="text-yellow-400">{dungeon.loot.gold}G</span>
              </div>
              {dungeon.loot.materials.length > 0 && (
                <div className="text-xs text-slate-500">
                  재료: {dungeon.loot.materials.map(m => m.id).join(", ")}
                </div>
              )}

              {/* 포션 슬롯 */}
              {totalSlots > 0 && (
                <>
                  <Separator className="bg-slate-700" />
                  <div>
                    <div className="text-xs text-slate-400 mb-2">포션 ({usedCount}/{totalSlots} 사용)</div>
                    <div className="flex flex-wrap gap-1">
                      {dungeon.potionSlots.map((itemId, idx) => {
                        const item = inventory.find(i => i.id === itemId)
                        const used = dungeon.usedPotions.slice(0, idx + 1).filter(p => p === itemId).length
                        > dungeon.potionSlots.slice(0, idx).filter(p => p === itemId).length
                        return (
                          <button key={idx}
                            onClick={() => usePotionInDungeon(itemId)}
                            disabled={used || dungeon.currentHP <= 0}
                            className={cn(
                              "text-xl p-1 rounded transition-all",
                              used ? "opacity-30 grayscale cursor-not-allowed" : "hover:scale-110 hover:bg-slate-700"
                            )}
                            title={item?.name}>
                            {item?.icon || "💊"}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 메인 전투/이벤트 */}
          <Card className="lg:col-span-2 bg-slate-800/80 border-slate-700">
            <CardContent className="p-6">
              {dungeon.currentEnemy ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-2">{dungeon.currentEnemy.icon}</div>
                    {dungeon.currentEnemy.isBoss && (
                      <Badge className="bg-red-700 text-white mb-2">BOSS</Badge>
                    )}
                    <h2 className="text-xl font-bold text-slate-100">{dungeon.currentEnemy.name}</h2>
                    <div className="mt-2">
                      <div className="flex justify-center items-center gap-2 text-sm mb-1">
                        <span className="text-red-400">HP</span>
                        <span className="text-slate-300">{dungeon.enemyHP}</span>
                      </div>
                      <Progress
                        value={(dungeon.enemyHP / Math.floor(dungeon.currentEnemy.hp * (1 + dungeon.floor * 0.05))) * 100}
                        className="h-2 bg-slate-700 w-48 mx-auto"
                      />
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs text-slate-500">
                      <span>방어: {dungeon.currentEnemy.defense}</span>
                      <span>마법저항: {dungeon.currentEnemy.magicResist}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    <Button onClick={attackEnemy} disabled={dungeon.currentHP <= 0}
                      className="bg-orange-600 hover:bg-orange-700 text-white">
                      ⚔️ 물리 공격
                    </Button>
                    <Button onClick={useMagicAttack} disabled={dungeon.currentHP <= 0}
                      className="bg-purple-600 hover:bg-purple-700 text-white">
                      ✨ 마법 공격
                    </Button>
                    <Button onClick={fleeDungeon} variant="outline" disabled={dungeon.currentHP <= 0}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
                      🏃 도망
                    </Button>
                  </div>
                </div>
              ) : dungeon.currentEncounter ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{dungeon.currentEncounter.icon}</div>
                    <h2 className="text-xl font-bold text-slate-100">{dungeon.currentEncounter.title}</h2>
                    <p className="text-slate-400 mt-2 max-w-md mx-auto">{dungeon.currentEncounter.description}</p>
                  </div>
                  <div className="space-y-2">
                    {dungeon.currentEncounter.choices?.map((choice, idx) => {
                      const ok = meetsReq(choice.requirements)
                      return (
                        <Button key={idx} variant="outline" disabled={!ok}
                          onClick={() => ok && resolveDungeonChoice(idx)}
                          className={cn(
                            "w-full h-auto p-4 text-left flex flex-col items-start gap-1 border-slate-600 bg-transparent",
                            ok ? "hover:bg-slate-700/50 hover:border-cyan-500 text-slate-200" : "opacity-50 cursor-not-allowed text-slate-500"
                          )}>
                          <span className="font-medium">{choice.text}</span>
                          {choice.requirements && (
                            <span className="text-xs text-slate-400">
                              필요: {Object.entries(choice.requirements).map(([k, v]) => (
                                <span key={k} className={cn("mr-2",
                                  k === "worldKnowledge" ? character.worldKnowledge >= (v||0) ? "text-cyan-400" : "text-red-400"
                                  : (character.stats[k as keyof Stats]||0) >= (v||0) ? "text-green-400" : "text-red-400"
                                )}>
                                  {k === "worldKnowledge" ? `세계이해 ${v}%` : `${statLabels[k]||k} ${v}`}
                                </span>
                              ))}
                            </span>
                          )}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl animate-pulse mb-4">🌀</div>
                  <p className="text-slate-400">던전 탐험 중...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 전투 로그 */}
        <Card className="bg-slate-800/80 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">전투 로그</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-28">
              <div className="space-y-1">
                {dungeon.combatLog.slice(-15).map((log, i) => (
                  <p key={i} className={cn("text-sm",
                    log.includes("처치") || log.includes("클리어") ? "text-green-400" :
                    log.includes("피해") || log.includes("쓰러") ? "text-red-400" :
                    log.includes("마법") || log.includes("비밀") || log.includes("마왕") || log.includes("여신") ? "text-purple-400" :
                    log.includes("재료") || log.includes("드롭") ? "text-yellow-400" :
                    log.includes("층") || log.includes("BOSS") ? "text-cyan-400" :
                    "text-slate-400"
                  )}>{log}</p>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
