"use client"

import { useGameStore, OUTFITS } from "@/lib/game-store"
import { CharacterPanel } from "./character-panel"
import { SchedulePanel } from "./schedule-panel"
import { EventLog } from "./event-log"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function GameDashboard() {
  const { goAdventure, setScreen, gold, character, wanderingMerchantActive, openWanderingMerchant } = useGameStore()

  const currentOutfit = OUTFITS.find(o => o.id === character.currentOutfit) || OUTFITS[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* 게임 로고 */}
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
              <Button variant="outline" size="sm" onClick={() => setScreen("settings")} className="gap-1 text-xs px-2">
                <span>⚙️</span> 설정
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 방랑상인 방문 배너 */}
      {wanderingMerchantActive && (
        <div className="border-b border-violet-200 bg-violet-50 dark:bg-violet-950/30">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-violet-700 dark:text-violet-300">
              <span className="text-xl">🧙</span>
              <span className="font-semibold">방랑상인이 이번 주 마을을 방문 중입니다!</span>
              <span className="hidden sm:inline text-xs text-violet-500">포션·소모품 구매 가능</span>
            </div>
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs px-3 h-7"
              onClick={openWanderingMerchant}>
              상인 만나기 →
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center text-4xl">
                      {character.personality?.dialogueStyle === "brave"       ? "🧒" :
                       character.personality?.dialogueStyle === "curious"     ? "🧐" :
                       character.personality?.dialogueStyle === "mischievous" ? "😈" :
                       character.personality?.dialogueStyle === "dreamy"      ? "🌙" : "👧"}
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
