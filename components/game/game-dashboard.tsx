"use client"

import { useState } from "react"
import { useGameStore, OUTFITS } from "@/lib/game-store"
import { CharacterPanel } from "./character-panel"
import { SchedulePanel } from "./schedule-panel"
import { EventLog } from "./event-log"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function GameDashboard() {
  const { setScreen, gold, character, saveGame } = useGameStore()
  const [showSave, setShowSave] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [saveMsg, setSaveMsg] = useState("")

  const currentOutfit = OUTFITS.find(o => o.id === character.currentOutfit) || OUTFITS[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-serif font-bold flex items-center gap-2">
              <span>&#x2728;</span> 별빛의 후예
            </h1>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScreen("talk")}
                className="gap-1"
              >
                <span>&#x1F4AC;</span> 대화
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScreen("wardrobe")}
                className="gap-1"
              >
                <span>&#x1F457;</span> 옷장
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScreen("shop")}
                className="gap-1"
              >
                <span>&#x1F3EA;</span> 상점
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScreen("inventory")}
                className="gap-1"
              >
                <span>&#x1F392;</span> 인벤토리
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScreen("ending-book")}
                className="gap-1"
              >
                <span>&#x1F4D6;</span> 엔딩 도감
              </Button>
              <Button
                size="sm"
                onClick={() => setScreen("ending-select")}
                className="gap-1 bg-primary/90"
              >
                <span>&#x1F31F;</span> 엔딩 보기
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Character Info */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            {/* Character Portrait Card */}
            <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center text-4xl">
                      {character.personality?.dialogueStyle === "brave" ? "\u{1F9D2}" :
                       character.personality?.dialogueStyle === "curious" ? "\u{1F9D0}" :
                       character.personality?.dialogueStyle === "mischievous" ? "\u{1F608}" :
                       character.personality?.dialogueStyle === "dreamy" ? "\u{1F31C}" : "\u{1F467}"}
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

          {/* Right Panel - Schedule */}
          <div className="lg:col-span-8 xl:col-span-9">
            <SchedulePanel />
          </div>
        </div>
      </main>
    </div>
  )
}
