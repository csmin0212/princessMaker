"use client"

import { useState, useEffect } from "react"
import { ACTIVITIES, Activity, useGameStore, DayResult } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const categoryInfo = {
  study:  { label: '학습', icon: '📚' },
  work:   { label: '일',   icon: '💼' },
  rest:   { label: '휴식', icon: '🌙' },
  social: { label: '사교', icon: '👥' },
  combat: { label: '전투', icon: '⚔️' },
}

const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일']

const resultStyle: Record<string, string> = {
  great:    'bg-yellow-50 border-yellow-300 text-yellow-800',
  success:  'bg-green-50 border-green-300 text-green-800',
  fail:     'bg-red-50 border-red-300 text-red-700',
  birthday: 'bg-pink-50 border-pink-300 text-pink-800',
  event:    'bg-purple-50 border-purple-300 text-purple-800',
  empty:    'bg-gray-50 border-gray-200 text-gray-500',
}


const statEmoji: Record<string, string> = {
  strength: '💪체', intelligence: '📚지', charm: '✨매', creativity: '🎨예',
  morality: '🌿도', faith: '🙏신', combat: '⚔전', magic: '🔮마',
  cooking: '🍳요', housework: '🏠가',
}

export function SchedulePanel() {
  const {
    weekSchedule, setWeekSchedule, executeWeek, weekResult, clearWeekResult,
    character, month, week, setScreen, resultWeek, resultMonth, gold,
  } = useGameStore()

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [revealedDays, setRevealedDays] = useState<number>(0)
  const [isExecuting, setIsExecuting] = useState(false)

  // 주간 시작 일자 (결과 표시 시 resultWeek 사용)
  const weekStartDay = (week - 1) * 7 + 1
  const resultStartDay = (resultWeek - 1) * 7 + 1

  // 생일 체크
  const birthdayDay = character.birthday.day
  const birthdayMonth = character.birthday.month
  const isBirthdayMonth = month === birthdayMonth

  const isBirthdaySlot = (slotIndex: number) => {
    const day = weekStartDay + slotIndex
    return isBirthdayMonth && day === birthdayDay
  }

  // 결과 애니메이션: 하루씩 카드 펼치기
  useEffect(() => {
    if (!weekResult) { setRevealedDays(0); return }
    setRevealedDays(0)
    let i = 0
    const timer = setInterval(() => {
      i++
      setRevealedDays(i)
      if (i >= weekResult.length) clearInterval(timer)
    }, 500)
    return () => clearInterval(timer)
  }, [weekResult])

  const handleSlotClick = (index: number) => {
    if (isBirthdaySlot(index)) return
    if (!selectedActivity) {
      // 클릭으로 해제 (던전이면 전체 해제)
      if (weekSchedule[index] === 'dungeon-explore') {
        setWeekSchedule([null, null, null, null, null, null, null])
      } else {
        const newSchedule = [...weekSchedule]
        newSchedule[index] = null
        setWeekSchedule(newSchedule)
      }
      return
    }
    // 던전 선택 시 첫 번째 슬롯에만 배치하고 나머지 전부 dungeon-explore로 채움
    if (selectedActivity.id === 'dungeon-explore') {
      const newSchedule = Array(7).fill('dungeon-explore') as (string | null)[]
      // 생일 슬롯은 유지
      for (let i = 0; i < 7; i++) {
        if (isBirthdaySlot(i)) newSchedule[i] = null
      }
      setWeekSchedule(newSchedule)
      setSelectedActivity(null)
      return
    }
    const newSchedule = [...weekSchedule]
    newSchedule[index] = selectedActivity.id
    setWeekSchedule(newSchedule)
  }

  const handleExecute = () => {
    setIsExecuting(true)
    executeWeek()
    setIsExecuting(false)
  }

  const handleClearResult = () => {
    clearWeekResult()
    setRevealedDays(0)
  }

  // 생일 슬롯도 채워진 칸으로 카운트
  const birthdaySlotCount = Array.from({ length: 7 }, (_, i) => isBirthdaySlot(i)).filter(Boolean).length
  const filledCount = weekSchedule.filter(s => s !== null).length + birthdaySlotCount

  // 요구 조건 충족 여부 체크
  const meetsRequirements = (activity: Activity): boolean => {
    if (!activity.requirements) return true
    for (const [stat, val] of Object.entries(activity.requirements)) {
      if ((character.stats[stat as keyof typeof character.stats] || 0) < (val || 0)) return false
    }
    return true
  }
  const canAffordActivity = (activity: Activity): boolean =>
    activity.goldChange >= 0 || gold >= Math.abs(activity.goldChange)
  const isActivityAvailable = (activity: Activity) => meetsRequirements(activity) && canAffordActivity(activity)

  // 결과 표시 화면
  if (weekResult) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold flex items-center gap-2">
            <span>📅</span> {resultMonth}월 {resultStartDay}~{resultStartDay + 6}일 결과
          </h2>
          {revealedDays >= weekResult.length && (
            <Button onClick={handleClearResult} size="sm">
              다음 주로 →
            </Button>
          )}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekResult.map((result, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl border-2 p-2 text-center transition-all duration-300 flex flex-col gap-1",
                i < revealedDays
                  ? resultStyle[result.result]
                  : "bg-muted/30 border-muted opacity-40 scale-95",
                i < revealedDays && "scale-100 shadow-sm"
              )}
              style={{
                transitionDelay: `${i * 50}ms`,
              }}
            >
              {/* 날짜 */}
              <div className="text-xs font-bold opacity-60">{DAY_NAMES[i]} ({result.day}일)</div>

              {/* 아이콘 */}
              <div className="text-2xl leading-none">
                {i < revealedDays ? result.activityIcon : '❓'}
              </div>

              {/* 활동명 */}
              <div className="text-xs font-medium leading-tight truncate">
                {i < revealedDays ? result.activityName : '...'}
              </div>

              {/* 결과 라벨 */}
              {i < revealedDays && (
                <div className="text-xs font-bold">{result.resultLabel}</div>
              )}

              {/* 변화량 */}
              {i < revealedDays && (result.statChanges || result.goldChange) && (
                <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                  {result.statChanges && Object.entries(result.statChanges).map(([stat, val]) => (
                    <span key={stat} className={cn(
                      "text-[10px] px-1.5 rounded-full font-medium",
                      (val ?? 0) > 0 ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                    )}>
                      {statEmoji[stat] || stat} {(val ?? 0) > 0 ? '+' : ''}{val}
                    </span>
                  ))}
                  {result.goldChange && (
                    <span className={cn(
                      "text-[10px] px-1 rounded-full font-medium",
                      result.goldChange > 0 ? "bg-yellow-200 text-yellow-800" : "bg-red-200 text-red-800"
                    )}>
                      {result.goldChange > 0 ? '+' : ''}{result.goldChange}G
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 주간 요약 */}
        {revealedDays >= weekResult.length && (
          <Card className="border-primary/20 bg-primary/5 animate-in fade-in duration-500">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2 text-center">📊 주간 요약</h3>
              <div className="flex justify-center gap-4 text-sm flex-wrap">
                <span className="text-yellow-600 font-bold">
                  ✨ 대성공 {weekResult.filter(r => r.result === 'great').length}회
                </span>
                <span className="text-green-600 font-bold">
                  ✅ 성공 {weekResult.filter(r => r.result === 'success').length}회
                </span>
                <span className="text-red-500 font-bold">
                  😔 실패 {weekResult.filter(r => r.result === 'fail').length}회
                </span>
                {weekResult.some(r => r.result === 'birthday') && (
                  <span className="text-pink-600 font-bold">🎂 생일!</span>
                )}
              </div>
              <div className="flex justify-center gap-4 text-sm mt-2 flex-wrap">
                {(() => {
                  const totalGold = weekResult.reduce((sum, r) => sum + (r.goldChange || 0), 0)
                  const totalStress = weekResult.reduce((sum, r) => sum + (r.stressChange || 0), 0)
                  return (
                    <>
                      {totalGold !== 0 && (
                        <span className={totalGold > 0 ? "text-yellow-700" : "text-red-500"}>
                          골드 {totalGold > 0 ? '+' : ''}{totalGold}G
                        </span>
                      )}
                      {totalStress !== 0 && (
                        <span className={totalStress < 0 ? "text-blue-600" : "text-orange-600"}>
                          스트레스 {totalStress > 0 ? '+' : ''}{totalStress}
                        </span>
                      )}
                    </>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // 스케줄 편집 화면
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif font-bold flex items-center gap-2">
          <span>📋</span> {month}월 {weekStartDay}~{weekStartDay + 6}일 계획
        </h2>
        <div className="text-sm text-muted-foreground">
          {filledCount}/7 배치
        </div>
      </div>

      {/* 활동 선택 팁 */}
      {selectedActivity ? (
        <div className="flex flex-col gap-1.5 px-3 py-2 bg-primary/10 rounded-lg border border-primary/30 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedActivity.icon}</span>
            <span className="font-medium text-primary">{selectedActivity.name}</span>
            <span className="text-muted-foreground text-xs">— 날짜 칸을 클릭해서 배치하세요</span>
            <Button size="sm" variant="ghost" className="ml-auto h-6 px-2 text-xs" onClick={() => setSelectedActivity(null)}>
              취소
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 text-xs">
            {Object.entries(selectedActivity.statChanges).map(([stat, val]) => {
              const nm: Record<string,string> = { strength:'체력',intelligence:'지능',charm:'매력',creativity:'예술',morality:'도덕',faith:'신앙',combat:'전투',magic:'마법',cooking:'요리',housework:'가사' }
              return <span key={stat} className={cn("px-1.5 py-0.5 rounded-full font-medium", (val??0)>0?"bg-green-100 text-green-700":"bg-red-100 text-red-700")}>{nm[stat]} {(val??0)>0?'+':''}{val}<span className="opacity-60 ml-0.5">(대성공×2)</span></span>
            })}
            {selectedActivity.stressChange !== 0 && (
              <span className={cn("px-1.5 py-0.5 rounded-full font-medium", selectedActivity.stressChange<0?"bg-blue-100 text-blue-700":"bg-orange-100 text-orange-700")}>
                😰 스트레스 {selectedActivity.stressChange>0?'+':''}{selectedActivity.stressChange}
              </span>
            )}
            {selectedActivity.goldChange !== 0 && (
              <span className={cn("px-1.5 py-0.5 rounded-full font-medium", selectedActivity.goldChange>0?"bg-yellow-100 text-yellow-700":"bg-red-100 text-red-700")}>
                🪙 {selectedActivity.goldChange>0?'+':''}{selectedActivity.goldChange}G
              </span>
            )}
            {(selectedActivity as any).healthChange && (selectedActivity as any).healthChange !== 0 && (
              <span className="px-1.5 py-0.5 rounded-full font-medium bg-rose-100 text-rose-700">
                ❤️ 건강 {(selectedActivity as any).healthChange>0?'+':''}{(selectedActivity as any).healthChange}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground px-1">
          아래에서 활동을 선택하고, 날짜 칸에 클릭해 배치하세요. 배치된 칸을 클릭하면 제거됩니다.
        </div>
      )}

      {/* 7일 그리드 */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }, (_, i) => {
          const day = weekStartDay + i
          const isBirthday = isBirthdaySlot(i)
          const activityId = weekSchedule[i]
          const activity = activityId ? ACTIVITIES.find(a => a.id === activityId) : null

          return (
            <div
              key={i}
              onClick={() => handleSlotClick(i)}
              className={cn(
                "rounded-xl border-2 p-2 text-center min-h-[90px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer",
                isBirthday
                  ? "bg-pink-50 border-pink-300 cursor-default"
                  : activity?.id === 'dungeon-explore'
                  ? "bg-slate-100 border-slate-400 hover:border-slate-600"
                  : activity
                  ? "bg-primary/5 border-primary/40 hover:border-primary"
                  : selectedActivity
                  ? "bg-muted/30 border-dashed border-primary/40 hover:bg-primary/10 hover:border-primary"
                  : "bg-muted/20 border-dashed border-muted-foreground/30 hover:bg-muted/40"
              )}
            >
              {/* 요일/날짜 */}
              <div className="text-xs font-bold text-muted-foreground">
                {DAY_NAMES[i]}
              </div>
              <div className="text-xs text-muted-foreground/70">{day}일</div>

              {isBirthday ? (
                <>
                  <div className="text-2xl">🎂</div>
                  <div className="text-xs font-bold text-pink-600">생일!</div>
                </>
              ) : activity ? (
                <>
                  <div className="text-xl">{activity.icon}</div>
                  <div className="text-[11px] font-medium text-foreground leading-tight text-center">
                    {activity.name}
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground/40 text-xl">+</div>
              )}
            </div>
          )
        })}
      </div>

      {/* 전체 채우기 버튼 */}
      {selectedActivity && (
        <Button variant="outline" size="sm" className="w-full text-xs"
          onClick={() => {
            const filled = weekSchedule.map((s, i) =>
              s === null && !isBirthdaySlot(i) ? selectedActivity.id : s
            )
            setWeekSchedule(filled)
          }}>
          📋 빈 칸 전부 "{selectedActivity.name}"으로 채우기
        </Button>
      )}

      {/* 예상 결과 요약 */}
      {filledCount > 0 && (() => {
        let totalGold = 0, totalStress = 0
        const statSums: Record<string, number> = {}
        const statShort: Record<string, string> = {
          strength:'💪체', intelligence:'📚지', charm:'✨매', creativity:'🎨예',
          morality:'🌿도', faith:'🙏신', combat:'⚔전', magic:'🔮마',
          cooking:'🍳요', housework:'🏠가',
        }
        weekSchedule.forEach((id, i) => {
          if (!id || isBirthdaySlot(i)) return
          const act = ACTIVITIES.find(a => a.id === id)
          if (!act) return
          totalGold += act.goldChange
          totalStress += act.stressChange
          Object.entries(act.statChanges).forEach(([s, v]) => {
            statSums[s] = (statSums[s] || 0) + (v || 0)
          })
        })
        return (
          <div className="px-3 py-2 bg-muted/30 rounded-lg border border-border text-xs flex flex-wrap gap-2 items-center">
            <span className="font-medium text-muted-foreground">이번 주 예상:</span>
            {totalGold !== 0 && (
              <span className={totalGold > 0 ? "text-amber-600 font-medium" : "text-red-500"}>
                🪙 {totalGold > 0 ? "+" : ""}{totalGold}G
              </span>
            )}
            {totalStress !== 0 && (
              <span className={totalStress < 0 ? "text-blue-600 font-medium" : "text-orange-500"}>
                😰 스트레스 {totalStress > 0 ? "+" : ""}{totalStress}
              </span>
            )}
            {Object.entries(statSums).filter(([,v]) => v !== 0).map(([s, v]) => (
              <span key={s} className={v > 0 ? "text-green-700 font-medium" : "text-red-500"}>
                {statShort[s] || s} {v > 0 ? "+" : ""}{v}
              </span>
            ))}
          </div>
        )
      })()}

      {/* 건강 경고 */}
      {character.health <= character.maxHealth * 0.25 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-300 rounded-lg text-red-700 text-xs font-medium">
          <span>🚨</span>
          <span>건강 위험 (25% 이하) — 모든 활동 실패 확률 <strong>+30%</strong></span>
        </div>
      )}
      {character.health > character.maxHealth * 0.25 && character.health <= character.maxHealth * 0.5 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-300 rounded-lg text-orange-700 text-xs font-medium">
          <span>⚠️</span>
          <span>건강 저하 (50% 이하) — 모든 활동 실패 확률 <strong>+20%</strong></span>
        </div>
      )}

      {/* 실행 버튼 */}
      <Button
        className="w-full"
        size="lg"
        disabled={filledCount === 0 || isExecuting}
        onClick={handleExecute}
      >
        {filledCount === 0 ? '활동을 배치해주세요' : `이번 주 실행하기 (${filledCount}일)`}
      </Button>

      {/* 활동 선택 팔레트 */}
      <Card>
        <CardHeader className="py-3 pb-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">활동 선택</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <Tabs defaultValue="study">
            <TabsList className="grid grid-cols-5 mb-3 h-8">
              {(Object.keys(categoryInfo) as Array<keyof typeof categoryInfo>).map(cat => (
                <TabsTrigger key={cat} value={cat} className="text-xs px-1 h-7 gap-1">
                  <span>{categoryInfo[cat].icon}</span>
                  <span className="hidden sm:inline">{categoryInfo[cat].label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {(Object.keys(categoryInfo) as Array<keyof typeof categoryInfo>).map(cat => (
              <TabsContent key={cat} value={cat} className="mt-0">
                <ScrollArea className="h-[200px]">
                  <div className="grid grid-cols-2 gap-2 pr-2">
                    {ACTIVITIES.filter(a => a.category === cat).map(activity => (
                      <button
                        key={activity.id}
                        disabled={!isActivityAvailable(activity)}
                        onClick={() => {
                          if (!isActivityAvailable(activity)) return
                          setSelectedActivity(selectedActivity?.id === activity.id ? null : activity)
                        }}
                        className={cn(
                          "flex items-start gap-2 p-3 rounded-lg border text-left transition-all",
                          !isActivityAvailable(activity)
                            ? "opacity-40 cursor-not-allowed border-muted bg-muted/10"
                            : selectedActivity?.id === activity.id
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <span className="text-xl flex-shrink-0 mt-0.5">{activity.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-xs">{activity.name}</div>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {/* 모든 스탯 변화 */}
                            {Object.entries(activity.statChanges).map(([stat, val]) => {
                              const statShort: Record<string, string> = {
                                strength:'체력', intelligence:'지능', charm:'매력',
                                creativity:'예술', morality:'도덕', faith:'신앙',
                                combat:'전투', magic:'마법', cooking:'요리', housework:'가사',
                              }
                              return (
                                <span key={stat} className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                                  (val ?? 0) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                  {statShort[stat]} {(val ?? 0) > 0 ? '+' : ''}{val}
                                </span>
                              )
                            })}
                            {/* 스트레스 */}
                            {activity.stressChange !== 0 && (
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                                activity.stressChange < 0 ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                              )}>
                                스트레스 {activity.stressChange > 0 ? '+' : ''}{activity.stressChange}
                              </span>
                            )}
                            {/* 골드 */}
                            {activity.goldChange !== 0 && (
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                                activity.goldChange > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                              )}>
                                {activity.goldChange > 0 ? '+' : ''}{activity.goldChange}G
                              </span>
                            )}
                            {/* 건강 변화 */}
                            {(activity as any).healthChange && (activity as any).healthChange !== 0 && (
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                                (activity as any).healthChange > 0 ? "bg-rose-100 text-rose-700" : "bg-red-100 text-red-700"
                              )}>
                                ❤️ {(activity as any).healthChange > 0 ? '+' : ''}{(activity as any).healthChange}
                              </span>
                            )}
                          </div>
                          {/* 필요 조건 */}
                          {activity.requirements && (
                            <div className="mt-1 flex gap-1 flex-wrap">
                              {Object.entries(activity.requirements).map(([stat, val]) => {
                                const statShort: Record<string, string> = {
                                  strength:'체력', intelligence:'지능', charm:'매력',
                                  creativity:'예술', morality:'도덕', faith:'신앙',
                                  combat:'전투', magic:'마법', cooking:'요리', housework:'가사',
                                }
                                const meets = (character.stats[stat as keyof typeof character.stats] || 0) >= (val || 0)
                                return (
                                  <span key={stat} className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded-full border font-medium",
                                    meets ? "border-green-300 text-green-600" : "border-red-300 text-red-600"
                                  )}>
                                    {meets ? '✓' : '✗'} {statShort[stat] || stat} {val}
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
