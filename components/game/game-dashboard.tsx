"use client"

import { useState } from "react"
import { useGameStore, OUTFITS } from "@/lib/game-store"
import { CharacterPanel } from "./character-panel"
import { SchedulePanel } from "./schedule-panel"
import { EventLog } from "./event-log"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { EventResultModal } from "./event-result-modal"

export function GameDashboard() {
  const { setScreen, gold, character, year, month, saveGame } = useGameStore()
  const [showSave, setShowSave] = useState(false)
  const [saved, setSaved] = useState(false)

  const currentOutfit = OUTFITS.find(o => o.id === character.currentOutfit) || OUTFITS[0]

  const handleSave = () => {
    const slotName = character.name + " · " + year + "년 " + month + "월"
    saveGame(slotName)
    setSaved(true)
    setTimeout(() => { setSaved(false); setShowSave(false) }, 1200)
  }

  const emoji = character.personality?.dialogueStyle === "brave" ? "🧒"
    : character.personality?.dialogueStyle === "curious" ? "🧐"
    : character.personality?.dialogueStyle === "mischievous" ? "😈"
    : character.personality?.dialogueStyle === "dreamy" ? "🌜" : "👧"

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-serif font-bold flex items-center gap-2">
              <span>✨</span> 별빛의 후예
            </h1>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Button variant="outline" size="sm" onClick={() => setScreen("talk")} className="gap-1"><span>💬</span> 대화</Button>
              <Button variant="outline" size="sm" onClick={() => setScreen("wardrobe")} className="gap-1"><span>👗</span> 옷장</Button>
              <Button variant="outline" size="sm" onClick={() => setScreen("shop")} className="gap-1"><span>🏪</span> 상점</Button>
              <Button variant="outline" size="sm" onClick={() => setScreen("inventory")} className="gap-1"><span>🎒</span> 인벤토리</Button>
              <Button variant="outline" size="sm" onClick={() => setScreen("ending-book")} className="gap-1"><span>📖</span> 엔딩 도감</Button>
              <Button size="sm" onClick={() => setScreen("ending-select")} className="gap-1 bg-primary/90"><span>🌟</span> 엔딩 보기</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center text-4xl">{emoji}</div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card border-2 flex items-center justify-center text-sm shadow">{currentOutfit.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-bold text-lg truncate">{character.name}</p>
                    {character.personality && <p className="text-xs text-primary font-medium">{character.personality.name}</p>}
                    <p className="text-xs text-muted-foreground">{character.age}세 · {year}년 {month}월</p>
                    <p className="text-xs text-muted-foreground">{currentOutfit.name} 착용중</p>
                  </div>
                </div>

                <Button
                  variant="outline" size="sm"
                  className="w-full gap-2 border-dashed hover:border-primary hover:bg-primary/5"
                  onClick={() => { setSaved(false); setShowSave(true) }}
                >
                  <span>💾</span>
                  <span>현재 상태 저장</span>
                  <span className="text-xs text-muted-foreground ml-auto">{year}년 {month}월</span>
                </Button>
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

      <Dialog open={showSave} onOpenChange={setShowSave}>
        <DialogContent className="max-w-xs">
          <DialogTitle>💾 게임 저장</DialogTitle>
          <DialogDescription>아래 내용으로 저장됩니다</DialogDescription>
          <div className="bg-muted/40 rounded-lg p-4 text-center space-y-1 my-2">
            <div className="text-3xl mb-1">{emoji}</div>
            <p className="font-bold text-base">{character.name}</p>
            <p className="text-sm text-muted-foreground">{year}년 {month}월 · {character.age}세 · 💰{gold}G</p>
            <p className="text-xs text-muted-foreground/60 mt-2">저장 슬롯: <span className="font-medium text-foreground">{character.name} · {year}년 {month}월</span></p>
          </div>
          {saved ? (
            <p className="text-center text-green-600 font-medium py-2">✅ 저장 완료!</p>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowSave(false)}>취소</Button>
              <Button className="flex-1" onClick={handleSave}>저장하기</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EventResultModal />
    </div>
  )
}
