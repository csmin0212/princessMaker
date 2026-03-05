"use client"

import { useGameStore } from "@/lib/game-store"
import { StatBar } from "./stat-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

export function CharacterPanel() {
  const { character, gold, year, month, week, dungeon } = useGameStore()
  
  const getSeason = () => {
    if (month >= 3 && month <= 5) return { name: "봄", icon: "🌸" }
    if (month >= 6 && month <= 8) return { name: "여름", icon: "☀️" }
    if (month >= 9 && month <= 11) return { name: "가을", icon: "🍂" }
    return { name: "겨울", icon: "❄️" }
  }
  
  const season = getSeason()
  
  const statConfig = [
    { key: 'strength', label: '체력', icon: '💪', color: 'bg-[oklch(0.55_0.15_45)]' },
    { key: 'intelligence', label: '지능', icon: '🧠', color: 'bg-[oklch(0.55_0.15_220)]' },
    { key: 'charm', label: '매력', icon: '✨', color: 'bg-[oklch(0.70_0.18_350)]' },
    { key: 'creativity', label: '예술', icon: '🎨', color: 'bg-[oklch(0.65_0.15_300)]' },
    { key: 'morality', label: '도덕', icon: '⚖️', color: 'bg-[oklch(0.60_0.12_160)]' },
    { key: 'faith', label: '신앙', icon: '🙏', color: 'bg-[oklch(0.70_0.15_85)]' },
    { key: 'combat', label: '전투', icon: '⚔️', color: 'bg-[oklch(0.55_0.20_25)]' },
    { key: 'magic', label: '마법', icon: '🔮', color: 'bg-[oklch(0.55_0.18_280)]' },
    { key: 'cooking', label: '요리', icon: '🍳', color: 'bg-[oklch(0.65_0.15_45)]' },
    { key: 'housework', label: '가사', icon: '🧹', color: 'bg-[oklch(0.60_0.10_180)]' },
  ]
  
  return (
    <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-serif">{character.name}</CardTitle>
          <span className="text-2xl">👧</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{character.age}세</span>
          <span className="text-primary font-semibold flex items-center gap-1">
            <span>🪙</span> {gold} G
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
          <span>{year}년차 {month}월 {week}주차</span>
          <span className="text-base">{season.icon}</span>
          <span className="text-muted-foreground/70">{season.name}</span>
        </div>

      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Health & Stress */}
        <div className="space-y-2">
          <StatBar 
            label="건강" 
            value={character.health} 
            maxValue={character.maxHealth}
            color="bg-[oklch(0.60_0.20_25)]"
            icon="❤️"
            size="lg"
          />
          <StatBar 
            label="스트레스" 
            value={character.stress} 
            maxValue={character.maxStress}
            color="bg-[oklch(0.55_0.18_280)]"
            icon="😰"
            size="lg"
          />
        </div>
        
        <Separator />
        
        {/* World Knowledge */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <span>🌍</span>
              <span className="font-semibold text-foreground/80">세계의 이해</span>
            </span>
            <span className="text-cyan-600 font-medium">{character.worldKnowledge}%</span>
          </div>
          <Progress 
            value={character.worldKnowledge} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {character.worldKnowledge < 20 ? "아직 세계에 대해 아는 것이 없습니다..." :
             character.worldKnowledge < 40 ? "세계에 대한 궁금증이 생깁니다." :
             character.worldKnowledge < 60 ? "숨겨진 진실이 있는 것 같습니다." :
             character.worldKnowledge < 80 ? "세계의 비밀에 가까워지고 있습니다." :
             "세계의 진실을 이해하기 시작했습니다."}
          </p>
        </div>
        
        <Separator />
        
        {/* Stats */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-foreground/80">능력치</h4>
          <div className="grid gap-2">
            {statConfig.map(stat => (
              <StatBar
                key={stat.key}
                label={stat.label}
                value={character.stats[stat.key as keyof typeof character.stats]}
                color={stat.color}
                icon={stat.icon}
                size="sm"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
