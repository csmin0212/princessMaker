"use client"

import { useGameStore, ENDINGS, OUTFITS, Stats } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { StatBar } from "./stat-bar"

export function EndingScreen() {
  const { ending, character, gold, resetGame, setScreen, unlockedEndings } = useGameStore()
  
  if (!ending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>엔딩 정보가 없습니다.</p>
      </div>
    )
  }
  
  const statConfig = [
    { key: "strength", label: "체력", color: "bg-[oklch(0.55_0.15_45)]" },
    { key: "intelligence", label: "지능", color: "bg-[oklch(0.55_0.15_220)]" },
    { key: "charm", label: "매력", color: "bg-[oklch(0.70_0.18_350)]" },
    { key: "creativity", label: "예술", color: "bg-[oklch(0.65_0.15_300)]" },
    { key: "morality", label: "도덕", color: "bg-[oklch(0.60_0.12_160)]" },
    { key: "faith", label: "신앙", color: "bg-[oklch(0.70_0.15_85)]" },
    { key: "combat", label: "전투", color: "bg-[oklch(0.55_0.20_25)]" },
    { key: "magic", label: "마법", color: "bg-[oklch(0.55_0.18_280)]" },
    { key: "cooking", label: "요리", color: "bg-[oklch(0.65_0.15_45)]" },
    { key: "housework", label: "가사", color: "bg-[oklch(0.60_0.10_180)]" },
  ]

  const difficultyStars = (d: number) => {
    const filled = "\u2605"
    const empty = "\u2606"
    return filled.repeat(d) + empty.repeat(5 - d)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background p-4 md:p-8 flex items-center justify-center">
      <Card className="max-w-2xl w-full border-2 border-primary/30 shadow-2xl">
        <CardHeader className="text-center border-b border-border/50 bg-gradient-to-b from-card to-muted/30 pb-8">
          <div className="text-8xl mb-4">{ending.image}</div>
          <CardTitle className="text-3xl font-serif mb-2">
            {character.name}의 미래
          </CardTitle>
          <CardDescription className="text-xl font-semibold text-primary">
            {ending.title}
          </CardDescription>
          <p className="text-yellow-600 mt-2 tracking-widest">{difficultyStars(ending.difficulty)}</p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-lg leading-relaxed text-foreground/90">
              {ending.description}
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-semibold text-center">최종 능력치</h3>
            <div className="grid grid-cols-2 gap-3">
              {statConfig.map(stat => (
                <StatBar
                  key={stat.key}
                  label={stat.label}
                  value={character.stats[stat.key as keyof Stats]}
                  color={stat.color}
                  size="sm"
                />
              ))}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span>최종 나이: <strong>{character.age}세</strong></span>
              <span>골드: <strong>{gold} G</strong></span>
              <span>세계 이해: <strong className="text-cyan-600">{character.worldKnowledge}%</strong></span>
            </div>
            
            {character.worldKnowledge >= 70 && (
              <div className="text-center mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                <p className="text-sm text-cyan-700">
                  당신은 이 세계의 진실을 깨달았습니다.
                  여신과 마왕, 빛과 어둠의 영원한 균형 속에서 세계가 존재한다는 것을...
                </p>
              </div>
            )}
          </div>
          
          <Separator />

          <div className="text-center text-sm text-muted-foreground">
            엔딩 수집: {unlockedEndings.length} / {ENDINGS.length}
          </div>
          
          <div className="flex justify-center gap-3">
            <Button size="lg" onClick={resetGame} className="px-8">
              🏠 타이틀로
            </Button>
            <Button size="lg" variant="outline" onClick={() => setScreen("ending-book")} className="px-8">
              엔딩 도감
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
