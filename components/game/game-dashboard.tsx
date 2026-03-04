"use client"

import { useState } from "react"
import { useGameStore, OUTFITS } from "@/lib/game-store"
import { CharacterPanel } from "./character-panel"
import { SchedulePanel } from "./schedule-panel"
import { EventLog } from "./event-log"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function GameDashboard() {
  const { setScreen, resetGame, saveGame, character, year, month } = useGameStore()
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveName, setSaveName] = useState("")

  const currentOutfit = OUTFITS.find(o => o.id === character.currentOutfit) || OUTFITS[0]

  const handleSave = () => {
    const name = saveName.trim() || `${character.name} · ${year}년차 ${month}월`
    saveGame(name)
    setSaveName("")
    setShowSaveModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-serif font-bold flex items-center gap-1 text-foreground shrink-0">
              <span>✨</span>
              <span className="hidden sm:inline">별빛의 후예</span>
            </span>

            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <Button variant="outline" size="sm" onClick={() => setScreen("dungeon-select")} className="gap-1 text-xs px-2">
                <span>🏰</span> 던전
              </Button>
              <Button variant="outline" size="sm" onClick={() => setScreen("craft")} className="gap-1 text-xs px-2">
                <span>⚒️</span> 제작
              </Button>
              <Button variant="outline" size="sm" onClick={() => setScreen("perk")} className="gap-1 text-xs px-2">
                <span>⭐</span> 특성
              </Button>
              <Button variant="outline" size="sm" onClick={() => setScreen("talk")} className="gap-1 text-xs px-2">
                <span>💬</span> 대화
              </Button>
              <Button variant="outline" size="sm" onClick={() => setScreen("wardrobe")} className="gap-1 text-xs px-2">
                <span>👗</span> 옷장
              </Button>
              <Button variant="outline" size="sm" onClick={() => setScreen("shop")} className="gap-1 text-xs px-2">
                <span>🏪</span> 상점
              </Button>
              <Button variant="outline" size="sm" onClick={() => setScreen("inventory")} className="gap-1 text-xs px-2">
                <span>🎒</span> 인벤토리
              </Button>
              <Button variant="outline" size="sm" onClick={() => setScreen("ending-select")} className="gap-1 text-xs px-2">
                <span>✨</span> 엔딩 보기
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSaveModal(true)} className="gap-1 text-xs px-2">
                <span>💾</span> 저장하기
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { if (confirm("타이틀로 돌아가시겠습니까?")) { resetGame() } }} className="gap-1 text-xs px-2 text-muted-foreground">
                <span>🏠</span> 타이틀로
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center text-4xl">
                      {character.personality?.dialogueStyle === "brave"      ? "🧒" :
                       character.personality?.dialogueStyle === "curious"    ? "🧐" :
                       character.personality?.dialogueStyle === "mischievous"? "😈" :
                       character.personality?.dialogueStyle === "dreamy"     ? "🌙" : "👧"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card border-2 flex items-center justify-center text-sm shadow">
                      {currentOutfit.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-bold text-lg truncate">{character.name}</p>
                    {character.personality && (
                      <p className="text-xs text-primary font-medium">{character.personality.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{currentOutfit.name} 착용중</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <CharacterPanel />
            <EventLog />
          </div>

          <div className="lg:col-span-8 xl:col-span-9">
            <SchedulePanel />
          </div>
        </div>
      </main>

      {/* 저장하기 모달 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm border-2">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-serif font-bold">💾 게임 저장</h2>
              <p className="text-sm text-muted-foreground">
                저장 이름을 입력하세요. 비워두면 자동으로 설정됩니다.
              </p>
              <input
                type="text"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSave()}
                placeholder={`${character.name} · ${year}년차 ${month}월`}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleSave}>저장</Button>
                <Button variant="outline" className="flex-1" onClick={() => { setShowSaveModal(false); setSaveName("") }}>취소</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
