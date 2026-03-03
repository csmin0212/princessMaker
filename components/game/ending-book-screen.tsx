"use client"

import { useGameStore, ENDINGS } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const categoryLabels: Record<string, string> = {
  legend: "전설",
  noble: "귀족",
  combat: "전투",
  magic: "마법",
  faith: "신앙",
  art: "예술",
  life: "생활",
  dark: "어둠",
  secret: "비밀",
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

export function EndingBookScreen() {
  const { unlockedEndings, setScreen, ending } = useGameStore()

  const difficultyStars = (d: number) => {
    const filled = "\u2605"
    const empty = "\u2606"
    return filled.repeat(d) + empty.repeat(5 - d)
  }

  const categories = ["legend", "noble", "combat", "magic", "faith", "art", "life", "dark", "secret"]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold">엔딩 도감</h1>
            <p className="text-muted-foreground text-sm">
              수집: {unlockedEndings.length} / {ENDINGS.length}
            </p>
          </div>
          <Button variant="outline" onClick={() => setScreen("title")}>
            타이틀로
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="all" className="text-xs">전체</TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="text-xs">
                {categoryLabels[cat]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <EndingGrid endings={ENDINGS} unlockedEndings={unlockedEndings} difficultyStars={difficultyStars} />
          </TabsContent>

          {categories.map(cat => (
            <TabsContent key={cat} value={cat}>
              <EndingGrid
                endings={ENDINGS.filter(e => e.category === cat)}
                unlockedEndings={unlockedEndings}
                difficultyStars={difficultyStars}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

function EndingGrid({
  endings,
  unlockedEndings,
  difficultyStars,
}: {
  endings: typeof ENDINGS
  unlockedEndings: string[]
  difficultyStars: (d: number) => string
}) {
  return (
    <ScrollArea className="h-[600px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
        {endings.map(e => {
          const unlocked = unlockedEndings.includes(e.id)

          return (
            <Card
              key={e.id}
              className={cn(
                "transition-all",
                unlocked ? "hover:shadow-md" : "opacity-50"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "text-4xl flex-shrink-0",
                    !unlocked && "grayscale blur-[2px]"
                  )}>
                    {unlocked ? e.image : "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold truncate">
                        {unlocked ? e.title : "???"}
                      </span>
                      <Badge className={cn("text-xs", categoryColors[e.category])}>
                        {categoryLabels[e.category]}
                      </Badge>
                    </div>
                    <p className="text-yellow-500 text-sm tracking-widest mt-1">
                      {difficultyStars(e.difficulty)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {unlocked ? e.description : "아직 해금되지 않았습니다."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}
