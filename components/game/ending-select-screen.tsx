"use client"

import { useGameStore, ENDINGS } from "@/lib/game-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const categoryLabels: Record<string, string> = {
  legend: "전설", noble: "귀족", combat: "전투", magic: "마법",
  faith: "신앙", art: "예술", life: "생활", dark: "어둠", secret: "비밀",
}

const categoryColors: Record<string, string> = {
  legend: "bg-yellow-100 text-yellow-700 border-yellow-300",
  noble: "bg-purple-100 text-purple-700 border-purple-300",
  combat: "bg-red-100 text-red-700 border-red-300",
  magic: "bg-blue-100 text-blue-700 border-blue-300",
  faith: "bg-amber-100 text-amber-700 border-amber-300",
  art: "bg-pink-100 text-pink-700 border-pink-300",
  life: "bg-green-100 text-green-700 border-green-300",
  dark: "bg-slate-200 text-slate-700 border-slate-400",
  secret: "bg-cyan-100 text-cyan-700 border-cyan-300",
}

const difficultyStars = (d: number) => "★".repeat(d) + "☆".repeat(5 - d)

export function EndingSelectScreen() {
  const { getQualifiedEndings, viewEnding, setScreen, character, gold, dungeon } = useGameStore()

  const qualified = getQualifiedEndings()
  // 조건 미충족 시 기본 엔딩(commoner) 항상 포함
  const commoner = ENDINGS.find(e => e.id === "commoner")!

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold">✨ 엔딩 선택</h1>
            <p className="text-sm text-muted-foreground mt-1">
              현재 {character.name}의 스탯으로 달성 가능한 엔딩입니다
            </p>
          </div>
          <Button variant="outline" onClick={() => setScreen("game")}>
            돌아가기
          </Button>
        </div>

        {/* 현재 스탯 요약 */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span>💰 <strong>{gold}G</strong></span>
              <span>🌍 세계의 이해 <strong className="text-cyan-600">{character.worldKnowledge}%</strong></span>
              <span>🏰 던전 최고 <strong>{dungeon.maxFloorReached}층</strong></span>
              <span>⚔️ 전투 <strong>{character.stats.combat}</strong></span>
              <span>✨ 마법 <strong>{character.stats.magic}</strong></span>
              <span>💎 매력 <strong>{character.stats.charm}</strong></span>
              <span>📚 지능 <strong>{character.stats.intelligence}</strong></span>
              <span>🙏 신앙 <strong>{character.stats.faith}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* 달성 가능한 엔딩 목록 */}
        {qualified.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground space-y-3">
            <div className="text-4xl">🌱</div>
            <p className="font-medium">아직 특별한 엔딩 조건을 충족하지 못했어요</p>
            <p className="text-sm">능력치를 더 키우면 다양한 엔딩을 볼 수 있어요!</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => viewEnding(commoner.id)}
            >
              {commoner.image} {commoner.title} 엔딩 보기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              {qualified.length}개의 엔딩 달성 가능 — 원하는 엔딩을 선택하세요
            </p>

            {qualified.map((ending) => (
              <button
                key={ending.id}
                onClick={() => viewEnding(ending.id)}
                className="w-full text-left"
              >
                <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl flex-shrink-0">{ending.image}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base">{ending.title}</span>
                          <Badge className={cn("text-xs border", categoryColors[ending.category])}>
                            {categoryLabels[ending.category]}
                          </Badge>
                        </div>
                        <p className="text-yellow-500 text-sm tracking-widest">
                          {difficultyStars(ending.difficulty)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {ending.description}
                        </p>
                      </div>
                      <div className="text-muted-foreground text-lg flex-shrink-0">→</div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}

            {/* 기본 엔딩도 항상 선택 가능 */}
            <button
              onClick={() => viewEnding(commoner.id)}
              className="w-full text-left"
            >
              <Card className="hover:shadow-md hover:border-muted-foreground/30 transition-all cursor-pointer border border-dashed opacity-70 hover:opacity-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{commoner.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{commoner.title}</span>
                        <Badge className={cn("text-xs border", categoryColors[commoner.category])}>
                          {categoryLabels[commoner.category]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{commoner.description}</p>
                    </div>
                    <div className="text-muted-foreground text-lg">→</div>
                  </div>
                </CardContent>
              </Card>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
