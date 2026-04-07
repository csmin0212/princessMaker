"use client"

import { useState } from "react"
import { useGameStore, NPCS, Stats, FestivalActivity } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ── 계절별 테마 ───────────────────────────────────────────────────────────────
const seasonConfig = {
  spring: {
    name: "봄",
    icon: "🌸",
    gradient: "from-pink-100 via-rose-50 to-green-50",
    cardBg: "bg-pink-50/80",
    border: "border-pink-200",
    accent: "text-pink-600",
    badge: "bg-pink-100 text-pink-700 border-pink-200",
    apColor: "text-pink-600",
    deco: ["🌸", "🌷", "🌼"],
  },
  summer: {
    name: "여름",
    icon: "☀️",
    gradient: "from-blue-100 via-cyan-50 to-yellow-50",
    cardBg: "bg-cyan-50/80",
    border: "border-cyan-200",
    accent: "text-cyan-600",
    badge: "bg-cyan-100 text-cyan-700 border-cyan-200",
    apColor: "text-cyan-600",
    deco: ["☀️", "🌊", "🏖️"],
  },
  fall: {
    name: "가을",
    icon: "🍂",
    gradient: "from-orange-100 via-amber-50 to-yellow-50",
    cardBg: "bg-amber-50/80",
    border: "border-amber-200",
    accent: "text-amber-600",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    apColor: "text-amber-600",
    deco: ["🍂", "🍁", "🌾"],
  },
  winter: {
    name: "겨울",
    icon: "❄️",
    gradient: "from-slate-100 via-blue-50 to-white",
    cardBg: "bg-slate-50/80",
    border: "border-slate-200",
    accent: "text-slate-600",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    apColor: "text-blue-600",
    deco: ["❄️", "⛄", "🌨️"],
  },
}

const statLabel: Record<string, string> = {
  strength: "체력", intelligence: "지능", charm: "매력",
  creativity: "예술", morality: "도덕", faith: "신앙",
  combat: "전투", magic: "마법", cooking: "요리", housework: "가사",
}

// ── 동반자 선택 화면 ───────────────────────────────────────────────────────────
function CompanionSelectPhase({ onSelect }: { onSelect: (id: string | null) => void }) {
  const { currentFestivalEvent, character, year } = useGameStore()
  if (!currentFestivalEvent) return null

  const festival = currentFestivalEvent
  const sc = seasonConfig[festival.season]

  // father 동반 가능 여부 (year 1 소풍 or companionType이 father)
  const canFather = festival.companionType === "father"

  // NPC 동반 가능 여부
  const eligibleNpcs = festival.companionType === "npc"
    ? NPCS.filter(npc => {
        const affection = character.npcAffection[npc.id] || 0
        const minAff = festival.companionMinAffection ?? 0
        const metYear = !npc.meetCondition?.year || year >= npc.meetCondition.year
        return affection >= minAff && metYear
      })
    : []

  const hasAnyCompanion = canFather || eligibleNpcs.length > 0

  return (
    <div className={cn("min-h-screen bg-gradient-to-b p-4 md:p-8", sc.gradient)}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm mb-4">
            <span className="text-2xl">{sc.icon}</span>
            <span className={cn("font-serif font-bold text-lg", sc.accent)}>{festival.title}</span>
            <span className="text-2xl">{sc.icon}</span>
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">{festival.description}</p>
        </div>

        {/* 동반자 선택 카드 */}
        <Card className={cn("border-2 shadow-xl backdrop-blur-sm", sc.cardBg, sc.border)}>
          <CardHeader className="text-center border-b border-inherit pb-4">
            <CardTitle className="text-xl font-serif">함께할 동반자를 선택하세요</CardTitle>
            <CardDescription>
              동반자와 함께하면 추가 대화와 친밀도가 올라갑니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {/* 혼자 가기 */}
            <button
              onClick={() => onSelect(null)}
              className="w-full text-left p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-white/60 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🚶</span>
                <div>
                  <p className="font-semibold group-hover:text-primary transition-colors">혼자 가기</p>
                  <p className="text-xs text-muted-foreground">조용히 혼자만의 시간을 즐깁니다.</p>
                </div>
              </div>
            </button>

            {/* 아버지 */}
            {canFather && (
              <button
                onClick={() => onSelect("father")}
                className="w-full text-left p-4 rounded-lg border-2 border-amber-200 bg-amber-50/60 hover:bg-amber-100/80 hover:border-amber-400 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👨</span>
                  <div>
                    <p className="font-semibold text-amber-800 group-hover:text-amber-900">아빠와 함께</p>
                    <p className="text-xs text-amber-700">따뜻한 아빠와 소중한 추억을 쌓습니다.</p>
                  </div>
                </div>
              </button>
            )}

            {/* NPC 목록 */}
            {eligibleNpcs.map(npc => {
              const affection = character.npcAffection[npc.id] || 0
              return (
                <button
                  key={npc.id}
                  onClick={() => onSelect(npc.id)}
                  className="w-full text-left p-4 rounded-lg border-2 border-primary/20 bg-white/60 hover:bg-white/90 hover:border-primary/60 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{npc.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold group-hover:text-primary transition-colors">{npc.name}</p>
                        <span className="text-xs text-muted-foreground">({npc.role})</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs text-rose-500">💗 호감도 {affection}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}

            {/* 동반자 없음 안내 */}
            {festival.companionType === "npc" && eligibleNpcs.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm border border-dashed rounded-lg">
                <p className="mb-1">아직 함께할 NPC가 없습니다.</p>
                <p className="text-xs">NPC와 대화하여 호감도 {festival.companionMinAffection ?? 20} 이상을 올려보세요.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 총 행동 포인트 안내 */}
        <div className="text-center text-sm text-muted-foreground">
          <span className={cn("font-bold text-base", sc.apColor)}>⭐ 행동 포인트: {festival.totalAP}</span>
          <span className="ml-2">— 활동을 골라 포인트를 사용하세요!</span>
        </div>
      </div>
    </div>
  )
}

// ── 활동 선택 화면 ────────────────────────────────────────────────────────────
function ActivitySelectPhase({ onEnd }: { onEnd: () => void }) {
  const {
    currentFestivalEvent, festivalAP, festivalActivitiesDone, festivalCompanionId,
    character, year, doFestivalActivity, festivalResults,
  } = useGameStore()

  if (!currentFestivalEvent) return null

  const festival = currentFestivalEvent
  const sc = seasonConfig[festival.season]

  const companionNpc = festivalCompanionId && festivalCompanionId !== "father"
    ? NPCS.find(n => n.id === festivalCompanionId)
    : null
  const companionLabel = festivalCompanionId === "father"
    ? "👨 아빠"
    : companionNpc
      ? `${companionNpc.icon} ${companionNpc.name}`
      : "🚶 혼자"

  const canDo = (activity: FestivalActivity) => {
    if (festivalAP < activity.apCost) return false
    if (festivalActivitiesDone.includes(activity.id)) return false
    if (activity.requiresCompanion && !festivalCompanionId) return false
    if (activity.minYear && year < activity.minYear) return false
    if (activity.requirements) {
      for (const [stat, val] of Object.entries(activity.requirements)) {
        if ((character.stats[stat as keyof Stats] || 0) < (val || 0)) return false
      }
    }
    return true
  }

  const getBlockReason = (activity: FestivalActivity): string | null => {
    if (festivalActivitiesDone.includes(activity.id)) return "이미 완료"
    if (festivalAP < activity.apCost) return "AP 부족"
    if (activity.requiresCompanion && !festivalCompanionId) return "동반자 필요"
    if (activity.minYear && year < activity.minYear) return `${activity.minYear}년차 이상`
    if (activity.requirements) {
      for (const [stat, val] of Object.entries(activity.requirements)) {
        if ((character.stats[stat as keyof Stats] || 0) < (val || 0)) {
          return `${statLabel[stat] ?? stat} ${val} 필요`
        }
      }
    }
    return null
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-b p-4 md:p-8", sc.gradient)}>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* 헤더 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm">
            <span className="text-2xl">{sc.icon}</span>
            <span className={cn("font-serif font-bold", sc.accent)}>{festival.title}</span>
          </div>
        </div>

        {/* 상태 바 */}
        <Card className={cn("border shadow-sm backdrop-blur-sm", sc.cardBg, sc.border)}>
          <CardContent className="p-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">동반자:</span>
              <span className="text-sm font-semibold">{companionLabel}</span>
            </div>
            <div className={cn("font-bold text-lg", sc.apColor)}>
              ⭐ AP: {festivalAP} / {festival.totalAP}
            </div>
            {festivalAP === 0 && (
              <Button size="sm" onClick={onEnd} className="h-8">
                축제 마치기 →
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 완료된 활동 */}
        {festivalResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">완료한 활동</p>
            {festivalResults.map((r, i) => (
              <Card key={i} className="border border-green-200 bg-green-50/60">
                <CardContent className="p-3 flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-green-800">{r.name}</p>
                      <Badge variant="outline" className="text-xs border-green-300 text-green-700 bg-green-50">완료 ✓</Badge>
                    </div>
                    <p className="text-xs text-green-700 mt-0.5">{r.description}</p>
                    {r.companionDescription && (
                      <p className="text-xs text-rose-600 mt-0.5 italic">💬 {r.companionDescription}</p>
                    )}
                    {/* 결과 수치 */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {r.statChanges && Object.entries(r.statChanges).map(([k, v]) => v ? (
                        <span key={k} className="text-xs font-medium text-blue-700">
                          {statLabel[k] ?? k} +{v}
                        </span>
                      ) : null)}
                      {r.goldChange && <span className={cn("text-xs font-medium", r.goldChange > 0 ? "text-amber-600" : "text-red-500")}>
                        🪙 {r.goldChange > 0 ? "+" : ""}{r.goldChange}G
                      </span>}
                      {r.stressChange && <span className={cn("text-xs font-medium", r.stressChange < 0 ? "text-green-600" : "text-red-500")}>
                        😌 스트레스 {r.stressChange > 0 ? "+" : ""}{r.stressChange}
                      </span>}
                      {r.outfitReward && <span className="text-xs font-medium text-purple-600">🎁 의상 획득!</span>}
                      {r.affectionGain && r.affectionGain > 0 && festivalCompanionId && festivalCompanionId !== "father" && (
                        <span className="text-xs font-medium text-rose-500">💗 호감도 +{r.affectionGain}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 선택 가능한 활동 */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">활동 목록</p>
          {festival.activities.map(activity => {
            const done = festivalActivitiesDone.includes(activity.id)
            const ok = canDo(activity)
            const reason = getBlockReason(activity)

            return (
              <Card
                key={activity.id}
                className={cn(
                  "border transition-all",
                  done && "opacity-40",
                  !done && !ok && "opacity-60",
                  !done && ok && "hover:shadow-md cursor-pointer",
                  sc.border
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0 mt-0.5">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{activity.name}</p>
                        <Badge variant="outline" className={cn("text-xs", sc.badge)}>
                          ⭐ AP {activity.apCost}
                        </Badge>
                        {activity.requiresCompanion && (
                          <Badge variant="outline" className="text-xs border-rose-200 text-rose-600 bg-rose-50">
                            동반자 필요
                          </Badge>
                        )}
                        {activity.minYear && activity.minYear > 1 && (
                          <Badge variant="outline" className="text-xs border-violet-200 text-violet-600 bg-violet-50">
                            {activity.minYear}년차+
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                      {/* 요구 스탯 */}
                      {activity.requirements && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(activity.requirements).map(([stat, val]) => {
                            const current = character.stats[stat as keyof Stats] || 0
                            const met = current >= (val || 0)
                            return (
                              <span key={stat} className={cn("text-xs", met ? "text-green-600" : "text-red-500")}>
                                {met ? "✓" : "✗"} {statLabel[stat] ?? stat} {val} ({current})
                              </span>
                            )
                          })}
                        </div>
                      )}
                      {/* 동반자 보너스 */}
                      {activity.companionBonus && festivalCompanionId && (
                        <p className="text-xs text-rose-500 mt-1 italic">
                          💬 동반자와 함께: {activity.companionBonus.description}
                        </p>
                      )}
                      {/* 보상 미리보기 */}
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {activity.outcome.statChanges && Object.entries(activity.outcome.statChanges).map(([k, v]) => v ? (
                          <span key={k} className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {statLabel[k] ?? k} +{v}
                          </span>
                        ) : null)}
                        {activity.outcome.goldChange && (
                          <span className={cn("text-xs px-1.5 py-0.5 rounded", activity.outcome.goldChange > 0 ? "text-amber-700 bg-amber-50" : "text-red-600 bg-red-50")}>
                            🪙 {activity.outcome.goldChange > 0 ? "+" : ""}{activity.outcome.goldChange}G
                          </span>
                        )}
                        {activity.outcome.stressChange && (
                          <span className={cn("text-xs px-1.5 py-0.5 rounded", activity.outcome.stressChange < 0 ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50")}>
                            {activity.outcome.stressChange < 0 ? "😌 스트레스 " : "😰 스트레스 +"}{activity.outcome.stressChange}
                          </span>
                        )}
                        {activity.outcome.outfitReward && (
                          <span className="text-xs text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">🎁 의상</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {done ? (
                        <span className="text-green-500 text-xl">✓</span>
                      ) : ok ? (
                        <Button
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => doFestivalActivity(activity.id)}
                        >
                          참가
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground text-right block max-w-[60px]">{reason}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 하단 종료 버튼 */}
        <div className="pb-8 text-center">
          <Button
            variant="outline"
            onClick={onEnd}
            className={cn("gap-2", sc.border)}
          >
            <span>{sc.icon}</span>
            {festivalAP > 0 ? `AP ${festivalAP} 남기고 ` : ""}축제 마치기
          </Button>
        </div>
      </div>

      {/* 배경 장식 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {sc.deco.map((d, i) => (
          <div
            key={i}
            className={cn(
              "absolute text-5xl opacity-20",
              i === 0 ? "top-16 left-10 animate-bounce" : i === 1 ? "top-40 right-16 animate-pulse" : "bottom-32 left-16 animate-bounce"
            )}
            style={{ animationDelay: `${i * 0.4}s` }}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 메인 축제 화면 ────────────────────────────────────────────────────────────
export function FestivalScreen() {
  const { currentFestivalEvent, selectFestivalCompanion, endFestival, setScreen } = useGameStore()
  const [phase, setPhase] = useState<"companion" | "activity">("companion")

  if (!currentFestivalEvent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <span className="text-6xl mb-4 block">🎉</span>
            <h2 className="text-xl font-serif font-bold mb-2">진행 중인 축제 없음</h2>
            <p className="text-muted-foreground mb-4">현재 진행 중인 축제가 없습니다.</p>
            <Button onClick={() => setScreen("game")}>돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleCompanionSelect = (id: string | null) => {
    selectFestivalCompanion(id)
    setPhase("activity")
  }

  const handleEnd = () => {
    endFestival()
  }

  if (phase === "companion") {
    return <CompanionSelectPhase onSelect={handleCompanionSelect} />
  }

  return <ActivitySelectPhase onEnd={handleEnd} />
}
