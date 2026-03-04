"use client"

import { useState } from "react"
import { useGameStore } from "@/lib/game-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function TitleScreen() {
  const { setScreen, resetGame, gameStarted, unlockedEndings, getSaveSlots, loadGame, deleteSave } = useGameStore()
  const [showLoadModal, setShowLoadModal] = useState(false)

  const saveSlots = getSaveSlots()

  const handleLoad = (slotKey: string) => {
    const ok = loadGame(slotKey)
    if (ok) setShowLoadModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8">

        {/* Title */}
        <div className="text-center space-y-4">
          <div className="text-7xl mb-4">✨</div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
            별빛의 후예
          </h1>
          <p className="text-lg text-muted-foreground">
            당신의 선택이 아이의 미래를 결정합니다
          </p>
        </div>

        {/* 버튼 카드 */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardContent className="space-y-3 pt-6">
            {/* 진행 중인 게임 이어하기 */}
            {gameStarted && (
              <Button size="lg" onClick={() => setScreen("game")} className="w-full">
                🌸 이어하기
              </Button>
            )}
            {/* 게임 시작 (새 게임) */}
            <Button
              size="lg"
              variant={gameStarted ? "outline" : "default"}
              onClick={() => { resetGame(); setScreen("character-creation") }}
              className="w-full"
            >
              ✨ 게임 시작
            </Button>
            {/* 불러오기 */}
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowLoadModal(true)}
              className="w-full"
              disabled={saveSlots.length === 0}
            >
              💾 불러오기 {saveSlots.length > 0 ? `(${saveSlots.length}개)` : "(없음)"}
            </Button>
            {/* 엔딩 도감 */}
            <Button
              size="lg"
              variant="outline"
              onClick={() => setScreen("ending-book")}
              className="w-full"
              disabled={unlockedEndings.length === 0}
            >
              📖 엔딩 도감 {unlockedEndings.length > 0 ? `(${unlockedEndings.length}개 달성)` : "(미달성)"}
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* 불러오기 모달 */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-2">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-serif font-bold">💾 저장 슬롯 선택</h2>
              {saveSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">저장된 게임이 없습니다.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {saveSlots.map(slot => (
                    <div key={slot.key} className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{slot.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {slot.characterName} · {slot.age}세 · {slot.year}년차 {slot.month}월
                        </p>
                        <p className="text-xs text-muted-foreground">{slot.savedAt}</p>
                      </div>
                      <Button size="sm" onClick={() => handleLoad(slot.key)}>불러오기</Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                        onClick={() => deleteSave(slot.key)}>
                        🗑
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => setShowLoadModal(false)}>닫기</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
