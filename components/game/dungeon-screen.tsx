"use client"

import { useGameStore, Stats } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export function DungeonScreen() {
  const {
    dungeon,
    character,
    attackEnemy,
    useMagicAttack,
    fleeDungeon,
    resolveDungeonChoice,
    endDungeon,
  } = useGameStore()

  const statLabels: Record<string, string> = {
    strength: "체력",
    intelligence: "지능",
    charm: "매력",
    creativity: "예술",
    morality: "도덕",
    faith: "신앙",
    combat: "전투",
    magic: "마법",
    cooking: "요리",
    housework: "가사",
  }

  const meetsRequirements = (
    requirements?: Partial<Stats> & { worldKnowledge?: number }
  ) => {
    if (!requirements) return true
    for (const [key, value] of Object.entries(requirements)) {
      if (key === "worldKnowledge") {
        if (character.worldKnowledge < (value || 0)) return false
      } else if (
        (character.stats[key as keyof Stats] || 0) < (value || 0)
      ) {
        return false
      }
    }
    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-100">
              심연의 던전
            </h1>
            <p className="text-slate-400 text-sm">
              {dungeon.floor}층 | 최고 기록: {dungeon.maxFloorReached}층
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => endDungeon(true)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            던전 탈출
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Player Status */}
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
                  <span className="text-slate-300">
                    {dungeon.currentHP} / {dungeon.maxHP}
                  </span>
                </div>
                <Progress
                  value={(dungeon.currentHP / dungeon.maxHP) * 100}
                  className="h-3 bg-slate-700"
                />
              </div>

              <Separator className="bg-slate-700" />

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-400">
                  전투력:{" "}
                  <span className="text-orange-400">
                    {character.stats.combat}
                  </span>
                </div>
                <div className="text-slate-400">
                  마법력:{" "}
                  <span className="text-purple-400">{character.stats.magic}</span>
                </div>
                <div className="text-slate-400">
                  체력:{" "}
                  <span className="text-green-400">
                    {character.stats.strength}
                  </span>
                </div>
                <div className="text-slate-400">
                  지능:{" "}
                  <span className="text-blue-400">
                    {character.stats.intelligence}
                  </span>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div className="text-sm">
                <div className="text-slate-400 mb-1">세계의 이해</div>
                <Progress
                  value={character.worldKnowledge}
                  className="h-2 bg-slate-700"
                />
                <div className="text-right text-xs text-cyan-400 mt-1">
                  {character.worldKnowledge}%
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div className="text-sm text-slate-400">
                획득 골드:{" "}
                <span className="text-yellow-400">{dungeon.loot.gold}G</span>
              </div>
            </CardContent>
          </Card>

          {/* Main Battle/Event Area */}
          <Card className="lg:col-span-2 bg-slate-800/80 border-slate-700">
            <CardContent className="p-6">
              {dungeon.currentEnemy ? (
                // Combat Mode
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-2">
                      {dungeon.currentEnemy.icon}
                    </div>
                    <h2 className="text-xl font-bold text-slate-100">
                      {dungeon.currentEnemy.name}
                    </h2>
                    <div className="mt-2">
                      <div className="flex justify-center items-center gap-2 text-sm mb-1">
                        <span className="text-red-400">HP</span>
                        <span className="text-slate-300">
                          {dungeon.enemyHP} /{" "}
                          {Math.floor(
                            dungeon.currentEnemy.hp * (1 + dungeon.floor * 0.1)
                          )}
                        </span>
                      </div>
                      <Progress
                        value={
                          (dungeon.enemyHP /
                            Math.floor(
                              dungeon.currentEnemy.hp *
                                (1 + dungeon.floor * 0.1)
                            )) *
                          100
                        }
                        className="h-2 bg-slate-700 w-48 mx-auto"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      onClick={attackEnemy}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      disabled={dungeon.currentHP <= 0}
                    >
                      <span className="mr-2">⚔️</span> 물리 공격
                    </Button>
                    <Button
                      onClick={useMagicAttack}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={dungeon.currentHP <= 0}
                    >
                      <span className="mr-2">✨</span> 마법 공격
                    </Button>
                    <Button
                      onClick={fleeDungeon}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                      disabled={dungeon.currentHP <= 0}
                    >
                      <span className="mr-2">🏃</span> 도망
                    </Button>
                  </div>
                </div>
              ) : dungeon.currentEncounter ? (
                // Encounter Mode
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">
                      {dungeon.currentEncounter.icon}
                    </div>
                    <h2 className="text-xl font-bold text-slate-100">
                      {dungeon.currentEncounter.title}
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-md mx-auto">
                      {dungeon.currentEncounter.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {dungeon.currentEncounter.choices?.map((choice, index) => {
                      const canChoose = meetsRequirements(choice.requirements)

                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className={cn(
                            "w-full h-auto p-4 text-left flex flex-col items-start gap-1 border-slate-600 bg-transparent",
                            canChoose
                              ? "hover:bg-slate-700/50 hover:border-cyan-500 text-slate-200"
                              : "opacity-50 cursor-not-allowed text-slate-500"
                          )}
                          onClick={() => canChoose && resolveDungeonChoice(index)}
                          disabled={!canChoose}
                        >
                          <span className="font-medium">{choice.text}</span>

                          {choice.requirements && (
                            <span className="text-xs text-slate-400">
                              필요:{" "}
                              {Object.entries(choice.requirements).map(
                                ([key, value]) => (
                                  <span
                                    key={key}
                                    className={cn(
                                      "mr-2",
                                      key === "worldKnowledge"
                                        ? character.worldKnowledge >= (value || 0)
                                          ? "text-cyan-400"
                                          : "text-red-400"
                                        : (character.stats[key as keyof Stats] ||
                                            0) >= (value || 0)
                                        ? "text-green-400"
                                        : "text-red-400"
                                    )}
                                  >
                                    {key === "worldKnowledge"
                                      ? `세계 이해 ${value}%`
                                      : `${statLabels[key] || key} ${value}`}
                                  </span>
                                )
                              )}
                            </span>
                          )}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                // Loading / Transitioning
                <div className="text-center py-12">
                  <div className="text-4xl animate-pulse mb-4">🌀</div>
                  <p className="text-slate-400">던전 탐험 중...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Combat Log */}
        <Card className="bg-slate-800/80 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">전투 로그</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {dungeon.combatLog.slice(-10).map((log, index) => (
                  <p
                    key={index}
                    className={cn(
                      "text-sm",
                      log.includes("처치") || log.includes("성공")
                        ? "text-green-400"
                        : log.includes("데미지를 받") || log.includes("쓰러")
                        ? "text-red-400"
                        : log.includes("마법") || log.includes("비밀")
                        ? "text-purple-400"
                        : log.includes("층") || log.includes("입장")
                        ? "text-cyan-400"
                        : "text-slate-400"
                    )}
                  >
                    {log}
                  </p>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
