"use client"

import { useState } from "react"
import { useGameStore, NPCS, NPC_ACCESSORIES, GIFT_GRADES, ITEMS, CRAFTED_ITEMS } from "@/lib/game-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const difficultyLabel = ["", "★", "★★", "★★★", "★★★★", "★★★★★"]
const difficultyColor = ["", "text-green-600", "text-green-500", "text-yellow-500", "text-orange-500", "text-red-500"]

export function NpcScreen() {
  const { character, inventory, setScreen, talkToNpc, giftToNpc, dateNpc, romanceNpc, getMetNpcs } = useGameStore()
  const [selectedNpc, setSelectedNpc] = useState<string | null>(null)
  const [giftMode, setGiftMode] = useState(false)

  const metNpcs = getMetNpcs()
  const npc = NPCS.find(n => n.id === selectedNpc)
  const affection = selectedNpc ? (character.npcAffection[selectedNpc] || 0) : 0
  const isMet = selectedNpc ? character.npcMet.includes(selectedNpc) : false
  const talkedToday = selectedNpc ? character.npcTalkedToday.includes(selectedNpc) : false

  // 선물 가능 아이템 목록
  const allGiftItems = [
    ...GIFT_GRADES.low.items,
    ...GIFT_GRADES.mid.items,
    ...GIFT_GRADES.high.items,
  ]
  const availableGifts = inventory.filter(i => allGiftItems.includes(i.id) && i.quantity > 0)

  const getGiftGrade = (itemId: string) => {
    if (GIFT_GRADES.high.items.includes(itemId)) return { label: "희귀", color: "text-purple-600" }
    if (GIFT_GRADES.mid.items.includes(itemId)) return { label: "고급", color: "text-blue-600" }
    return { label: "일반", color: "text-gray-500" }
  }

  const getAffectionStage = (aff: number) => {
    if (aff >= 100) return { label: "💖 최대", color: "text-red-500" }
    if (aff >= 60) return { label: "💕 깊은 인연", color: "text-pink-500" }
    if (aff >= 30) return { label: "💙 친밀", color: "text-blue-500" }
    if (aff > 0) return { label: "🤝 지인", color: "text-green-500" }
    return { label: "❓ 낯선 사람", color: "text-gray-400" }
  }

  // 로맨스 가능 여부 확인
  const canRomance = (npcId: string) => {
    const n = NPCS.find(x => x.id === npcId)
    if (!n || (character.npcAffection[npcId] || 0) < 100) return false
    if (character.romancedNpc) return false
    if (n.romanceCondition?.morality) {
      const m = character.stats.morality
      const rc = n.romanceCondition.morality
      if (rc.min !== undefined && m < rc.min) return false
      if (rc.max !== undefined && m > rc.max) return false
    }
    return true
  }

  const giftAcc = npc ? NPC_ACCESSORIES.find(a => a.id === npc.giftAccessoryId) : null
  const hasGiftAcc = npc ? character.ownedAccessories.includes(npc.giftAccessoryId) : false

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background p-4">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold">👥 인물</h1>
            <p className="text-muted-foreground text-sm">아카데미와 왕국에서 만난 인물들</p>
          </div>
          <Button variant="outline" onClick={() => setScreen("game")}>돌아가기</Button>
        </div>

        {!selectedNpc ? (
          // NPC 목록
          <div>
            {metNpcs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-4xl mb-3">👤</div>
                <p>아직 아무도 만나지 못했습니다.</p>
                <p className="text-sm mt-1">아카데미 입학(2년차 봄) 이후 NPC를 만날 수 있습니다.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">만난 인물 {metNpcs.length}명</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {metNpcs.map(n => {
                    const aff = character.npcAffection[n.id] || 0
                    const met = character.npcMet.includes(n.id)
                    const stage = getAffectionStage(aff)
                    const talked = character.npcTalkedToday.includes(n.id)
                    return (
                      <Card key={n.id}
                        className={cn("cursor-pointer border-2 transition-all hover:shadow-md",
                          character.romancedNpc === n.id ? "border-pink-400 bg-pink-50" : "border-border")}
                        onClick={() => setSelectedNpc(n.id)}>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="text-4xl">{n.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold">{n.name}</span>
                              {character.romancedNpc === n.id && <Badge className="bg-pink-100 text-pink-700 text-xs">💖 연인</Badge>}
                              {talked && <Badge variant="secondary" className="text-xs">오늘 대화 완료</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{n.role}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 bg-muted rounded-full h-1.5 max-w-24">
                                <div className="bg-pink-400 h-1.5 rounded-full transition-all" style={{ width: `${aff}%` }} />
                              </div>
                              <span className={cn("text-xs font-medium", stage.color)}>{stage.label}</span>
                              <span className="text-xs text-muted-foreground">{aff}/100</span>
                            </div>
                          </div>
                          <div className={cn("text-sm font-bold", difficultyColor[n.difficulty])}>
                            {difficultyLabel[n.difficulty]}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        ) : npc ? (
          // NPC 상세 / 상호작용
          <div className="max-w-lg mx-auto">
            <Button variant="ghost" className="mb-4" onClick={() => { setSelectedNpc(null); setGiftMode(false) }}>
              ← 목록으로
            </Button>

            {!giftMode ? (
              <Card className={cn("border-2", character.romancedNpc === npc.id ? "border-pink-400" : "border-border")}>
                <CardContent className="p-6">
                  {/* NPC 헤더 */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className="text-6xl">{npc.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold">{npc.name}</h2>
                        {character.romancedNpc === npc.id && <Badge className="bg-pink-100 text-pink-700">💖 연인</Badge>}
                        <span className={cn("text-sm font-bold", difficultyColor[npc.difficulty])}>
                          {difficultyLabel[npc.difficulty]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{npc.role}</p>
                      <p className="text-xs text-muted-foreground mt-1">{npc.description}</p>
                    </div>
                  </div>

                  {/* 호감도 바 */}
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">호감도</span>
                      <span className={cn("text-sm font-bold", getAffectionStage(affection).color)}>
                        {affection}/100 — {getAffectionStage(affection).label}
                      </span>
                    </div>
                    <div className="bg-muted rounded-full h-3">
                      <div className="bg-gradient-to-r from-pink-300 to-rose-500 h-3 rounded-full transition-all"
                        style={{ width: `${affection}%` }} />
                    </div>
                    {affection >= 30 && affection < 60 && <p className="text-xs text-muted-foreground mt-1">💙 60 달성 시 데이트 가능</p>}
                    {affection >= 60 && affection < 100 && <p className="text-xs text-muted-foreground mt-1">💕 100 달성 시 전용 장신구 + 로맨스</p>}
                    {affection >= 100 && !hasGiftAcc && <p className="text-xs text-pink-500 mt-1">🎁 전용 장신구를 선물로 받을 수 있습니다!</p>}
                  </div>

                  {/* 전용 장신구 */}
                  {giftAcc && (
                    <div className={cn("rounded-lg p-3 mb-5 border",
                      hasGiftAcc ? "bg-pink-50 border-pink-200" : "bg-muted/40 border-border")}>
                      <p className="text-xs font-medium text-muted-foreground mb-1">전용 장신구</p>
                      <div className="flex items-center gap-2">
                        <span>{giftAcc.icon}</span>
                        <span className="text-sm font-medium">{giftAcc.name}</span>
                        {hasGiftAcc
                          ? <Badge className="text-xs bg-pink-100 text-pink-700">획득 완료</Badge>
                          : <Badge variant="secondary" className="text-xs">호감 100 달성 시</Badge>}
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => talkToNpc(npc.id)}
                      disabled={talkedToday && isMet}>
                      {!isMet ? "🤝 처음 만나기" : talkedToday ? "💬 오늘 이미 대화함" : "💬 대화하기"}
                    </Button>

                    {isMet && (
                      <Button variant="outline" className="w-full" onClick={() => setGiftMode(true)}
                        disabled={availableGifts.length === 0}>
                        🎁 선물하기 {availableGifts.length === 0 ? "(선물 없음)" : `(${availableGifts.length}종)`}
                      </Button>
                    )}

                    {isMet && affection >= 60 && (
                      <Button variant="outline" className="w-full border-pink-300 text-pink-600 hover:bg-pink-50"
                        onClick={() => dateNpc(npc.id)}>
                        💕 데이트하기
                      </Button>
                    )}

                    {canRomance(npc.id) && (
                      <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                        onClick={() => romanceNpc(npc.id)}>
                        💖 마음을 전하기
                      </Button>
                    )}

                    {npc.romanceCondition?.morality && !canRomance(npc.id) && affection >= 100 && !character.romancedNpc && (
                      <p className="text-xs text-center text-muted-foreground">
                        {npc.romanceCondition.morality.max !== undefined
                          ? `⚠️ 도덕이 ${npc.romanceCondition.morality.max} 이하여야 로맨스 가능`
                          : `⚠️ 도덕이 ${npc.romanceCondition.morality.min} 이상이어야 로맨스 가능`}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              // 선물 선택 모드
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-3xl">{npc.icon}</span>
                    <div>
                      <h2 className="font-bold">{npc.name}에게 선물</h2>
                      <p className="text-xs text-muted-foreground">등급이 높을수록 호감이 많이 오릅니다</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {availableGifts.map(item => {
                      const grade = getGiftGrade(item.id)
                      const gainAmt = GIFT_GRADES.high.items.includes(item.id)
                        ? GIFT_GRADES.high.affectionGain
                        : GIFT_GRADES.mid.items.includes(item.id)
                          ? GIFT_GRADES.mid.affectionGain
                          : GIFT_GRADES.low.affectionGain
                      return (
                        <button key={item.id}
                          className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors flex items-center justify-between"
                          onClick={() => { giftToNpc(npc.id, item.id); setGiftMode(false) }}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{item.icon}</span>
                            <div>
                              <span className="text-sm font-medium">{item.name}</span>
                              <span className={cn("text-xs ml-2", grade.color)}>[{grade.label}]</span>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-pink-500">+{gainAmt} 💕</span>
                        </button>
                      )
                    })}
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => setGiftMode(false)}>
                    취소
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
