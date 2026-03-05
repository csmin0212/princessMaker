"use client"

import { useState, useEffect } from "react"
import { useGameStore } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function TitleScreen() {
  const { setScreen, resetGame, gameStarted, unlockedEndings, getSaveSlots, loadGame } = useGameStore()
  const [mounted, setMounted] = useState(false)
  const [showLoadPanel, setShowLoadPanel] = useState(false)
  const [saveSlots, setSaveSlots] = useState<ReturnType<typeof getSaveSlots>>([])

  useEffect(() => {
    setMounted(true)
    setSaveSlots(getSaveSlots())
  }, [])

  const hasGame = mounted && gameStarted
  const endingCount = mounted ? unlockedEndings.length : 0

  const handleLoad = (key: string) => {
    if (loadGame(key)) setScreen("game")
  }

  const toggleLoad = () => {
    if (!showLoadPanel) setSaveSlots(getSaveSlots())
    setShowLoadPanel(v => !v)
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
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-serif">새로운 여정 시작</CardTitle>
            <CardDescription>10살 아이를 18살이 될 때까지 육성하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">

            {/* 이어하기: 진행 중인 게임 있을 때 */}
            {hasGame && (
              <Button size="lg" onClick={() => setScreen("game")} className="w-full">
                🌸 이어하기
              </Button>
            )}

            {/* 저장 슬롯에서 불러오기 */}
            <Button
              size="lg"
              variant="outline"
              onClick={toggleLoad}
              className="w-full"
              disabled={!mounted}
            >
              💾 저장 데이터 불러오기
            </Button>

            {/* 저장 슬롯 목록 */}
            {showLoadPanel && (
              <div className="border rounded-lg bg-muted/30 p-3 space-y-2">
                {saveSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">저장된 데이터가 없습니다.</p>
                ) : (
                  saveSlots.map(slot => (
                    <div key={slot.key} className="flex items-center gap-2 bg-card rounded px-3 py-2 shadow-sm">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{slot.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {slot.savedAt
                            ? new Date(slot.savedAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                            : ""}
                        </p>
                      </div>
                      <Button size="sm" className="h-7 text-xs shrink-0" onClick={() => handleLoad(slot.key)}>
                        불러오기
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 새 게임 */}
            <Button
              size="lg"
              variant={hasGame ? "ghost" : "default"}
              onClick={() => { resetGame(); setScreen("character-creation") }}
              className="w-full"
            >
              ✨ 새 게임 시작
            </Button>

            {/* 엔딩 도감 */}
            <Button
              size="lg"
              variant="outline"
              onClick={() => setScreen("ending-book")}
              className="w-full"
              disabled={endingCount === 0}
            >
              📖 엔딩 도감 {endingCount > 0 ? `(${endingCount}개 달성)` : "(미달성)"}
            </Button>

            {/* 설정 */}
            <Button
              size="lg"
              variant="ghost"
              onClick={() => setScreen("settings")}
              className="w-full text-muted-foreground"
            >
              ⚙️ 설정
            </Button>

          </CardContent>
        </Card>

      </div>
    </div>
  )
}
