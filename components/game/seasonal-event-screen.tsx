"use client"

import { useGameStore, Stats } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const seasonConfig = {
  spring: {
    name: "봄",
    icon: "🌸",
    gradient: "from-pink-100 via-rose-50 to-green-50",
    cardBg: "bg-pink-50/80",
    border: "border-pink-200",
    accent: "text-pink-600",
  },
  summer: {
    name: "여름",
    icon: "☀️",
    gradient: "from-blue-100 via-cyan-50 to-yellow-50",
    cardBg: "bg-cyan-50/80",
    border: "border-cyan-200",
    accent: "text-cyan-600",
  },
  fall: {
    name: "가을",
    icon: "🍂",
    gradient: "from-orange-100 via-amber-50 to-yellow-50",
    cardBg: "bg-amber-50/80",
    border: "border-amber-200",
    accent: "text-amber-600",
  },
  winter: {
    name: "겨울",
    icon: "❄️",
    gradient: "from-slate-100 via-blue-50 to-white",
    cardBg: "bg-slate-50/80",
    border: "border-slate-200",
    accent: "text-slate-600",
  },
}

export function SeasonalEventScreen() {
  const { currentSeasonalEvent, character, resolveSeasonalEvent, setScreen } =
    useGameStore()

  if (!currentSeasonalEvent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <span className="text-6xl mb-4 block">🌿</span>
            <h2 className="text-xl font-serif font-bold mb-2">이벤트 없음</h2>
            <p className="text-muted-foreground mb-4">
              현재 진행 중인 계절 이벤트가 없습니다.
            </p>
            <Button onClick={() => setScreen("game")}>돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const season = seasonConfig[currentSeasonalEvent.season]

  const statLabels: Record<string, string> = {
    strength: "체력",
    intelligence: "지능",
    charm: "매력",
    creativity: "예술",
    morality: "도덕",
    faith: "신앙",
    combat: "전투",
    magic: "마법",
    cooking: "요리",
    housework: "가사",
  }

  const meetsRequirements = (requirements?: Partial<Stats>) => {
    if (!requirements) return true
    for (const [stat, value] of Object.entries(requirements)) {
      if ((character.stats[stat as keyof Stats] || 0) < (value || 0)) {
        return false
      }
    }
    return true
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-b p-4 md:p-8",
        season.gradient
      )}
    >
      <div className="max-w-2xl mx-auto">
        {/* Season Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm">
            <span className="text-2xl">{season.icon}</span>
            <span className={cn("font-serif font-bold", season.accent)}>
              {season.name} 이벤트
            </span>
            <span className="text-2xl">{season.icon}</span>
          </div>
        </div>

        <Card
          className={cn(
            "border-2 shadow-xl backdrop-blur-sm",
            season.cardBg,
            season.border
          )}
        >
          <CardHeader className="text-center border-b border-inherit">
            <div className="text-6xl mb-4">{season.icon}</div>
            <CardTitle className="text-2xl font-serif">
              {currentSeasonalEvent.title}
            </CardTitle>
            <CardDescription className="text-base mt-2 text-foreground/70">
              {currentSeasonalEvent.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg text-center mb-4">
              어떻게 하시겠습니까?
            </h3>

            <div className="space-y-3">
              {currentSeasonalEvent.choices.map((choice, index) => {
                const canChoose = meetsRequirements(choice.requirements)

                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={cn(
                      "w-full h-auto p-4 text-left flex flex-col items-start gap-2 transition-all bg-white/50",
                      canChoose
                        ? "hover:bg-white/80 hover:border-primary/50"
                        : "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => canChoose && resolveSeasonalEvent(index)}
                    disabled={!canChoose}
                  >
                    <span className="font-medium text-foreground">
                      {choice.text}
                    </span>

                    {choice.requirements && (
                      <span className="text-xs text-muted-foreground">
                        필요:{" "}
                        {Object.entries(choice.requirements).map(
                          ([stat, value]) => (
                            <span
                              key={stat}
                              className={cn(
                                "mr-2",
                                (character.stats[stat as keyof Stats] || 0) >=
                                  (value || 0)
                                  ? "text-green-600"
                                  : "text-red-500"
                              )}
                            >
                              {statLabels[stat]} {value}
                            </span>
                          )
                        )}
                      </span>
                    )}

                    {choice.outcomes.worldKnowledgeChange && (
                      <span className="text-xs text-cyan-600">
                        세계의 비밀에 다가갈 수 있을 것 같습니다...
                      </span>
                    )}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Decorative elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          {currentSeasonalEvent.season === "spring" && (
            <>
              <div className="absolute top-20 left-10 text-4xl opacity-30 animate-bounce">
                🌸
              </div>
              <div
                className="absolute top-40 right-20 text-3xl opacity-20 animate-bounce"
                style={{ animationDelay: "0.5s" }}
              >
                🌷
              </div>
              <div
                className="absolute bottom-40 left-20 text-5xl opacity-20 animate-bounce"
                style={{ animationDelay: "1s" }}
              >
                🌼
              </div>
            </>
          )}
          {currentSeasonalEvent.season === "summer" && (
            <>
              <div className="absolute top-20 right-10 text-4xl opacity-30 animate-pulse">
                ☀️
              </div>
              <div
                className="absolute top-60 left-10 text-3xl opacity-20 animate-pulse"
                style={{ animationDelay: "0.3s" }}
              >
                🌊
              </div>
              <div
                className="absolute bottom-20 right-20 text-5xl opacity-20 animate-pulse"
                style={{ animationDelay: "0.7s" }}
              >
                🏖️
              </div>
            </>
          )}
          {currentSeasonalEvent.season === "fall" && (
            <>
              <div className="absolute top-20 left-20 text-4xl opacity-30 animate-bounce">
                🍂
              </div>
              <div
                className="absolute top-40 right-10 text-3xl opacity-20 animate-bounce"
                style={{ animationDelay: "0.4s" }}
              >
                🍁
              </div>
              <div
                className="absolute bottom-30 left-10 text-5xl opacity-20 animate-bounce"
                style={{ animationDelay: "0.8s" }}
              >
                🌾
              </div>
            </>
          )}
          {currentSeasonalEvent.season === "winter" && (
            <>
              <div className="absolute top-10 right-20 text-4xl opacity-30 animate-pulse">
                ❄️
              </div>
              <div
                className="absolute top-50 left-10 text-3xl opacity-20 animate-pulse"
                style={{ animationDelay: "0.2s" }}
              >
                ⛄
              </div>
              <div
                className="absolute bottom-40 right-10 text-5xl opacity-20 animate-pulse"
                style={{ animationDelay: "0.6s" }}
              >
                🌨️
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
