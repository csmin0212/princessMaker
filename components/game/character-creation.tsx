"use client"

import { useState } from "react"
import { useGameStore, PERSONALITIES } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Step = "intro" | "name" | "birthday" | "personality" | "confirm"

export function CharacterCreation() {
  const { setPersonality, setScreen } = useGameStore()
  const [step, setStep] = useState<Step>("intro")
  const [name, setName] = useState("")
  const [birthMonth, setBirthMonth] = useState(1)
  const [birthDay, setBirthDay] = useState(1)
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null)

  const getDaysInMonth = (month: number) => {
    const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    return daysPerMonth[month - 1]
  }

  const handleConfirm = () => {
    const personality = PERSONALITIES.find(p => p.id === selectedPersonality)
    if (personality && name.trim()) {
      // This calls the store to set everything and go to "game" screen
      useGameStore.getState().startCharacterCreation(name.trim(), { month: birthMonth, day: birthDay })
      setPersonality(personality)
    }
  }

  const selected = PERSONALITIES.find(p => p.id === selectedPersonality)

  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Progress */}
        <div className="flex justify-center gap-2">
          {["intro", "name", "birthday", "personality"].map((s, i) => {
            const steps: Step[] = ["intro", "name", "birthday", "personality"]
            const currentIdx = steps.indexOf(step === "confirm" ? "personality" : step)
            return (
              <div
                key={s}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  i === currentIdx
                    ? "bg-primary"
                    : i < currentIdx
                      ? "bg-primary/50"
                      : "bg-muted"
                )}
              />
            )
          })}
        </div>

        {/* Intro */}
        {step === "intro" && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">&#x2728;</div>
              <CardTitle className="text-2xl font-serif">별빛의 후예</CardTitle>
              <CardDescription className="text-base mt-4 leading-relaxed">
                오래 전, 여신과 마왕이 하나였을 때 세계는 완전했습니다.
                <br /><br />
                그들이 갈라진 순간, 빛과 어둠이 태어나고 세계가 시작되었지요.
                <br /><br />
                그리고 오늘, 작은 아이가 당신의 품에 안겼습니다.
                <br />
                이 아이의 운명은... 당신의 손에 달려 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" onClick={() => setStep("name")} className="w-full">
                아이를 만나러 가기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Name */}
        {step === "name" && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="text-5xl mb-4">&#x1F476;</div>
              <CardTitle className="text-2xl font-serif">아이의 이름을 지어주세요</CardTitle>
              <CardDescription>
                새로운 생명이 당신의 품에 안겼습니다...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="char-name">이름</Label>
                <Input
                  id="char-name"
                  placeholder="이름을 입력하세요..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep("birthday")}
                  className="text-center text-lg"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("intro")} className="flex-1">
                  이전
                </Button>
                <Button
                  onClick={() => setStep("birthday")}
                  disabled={!name.trim()}
                  className="flex-1"
                >
                  다음
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Birthday */}
        {step === "birthday" && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="text-5xl mb-4">&#x1F382;</div>
              <CardTitle className="text-2xl font-serif">{name}의 생일은 언제인가요?</CardTitle>
              <CardDescription>
                별들이 정한 운명의 날...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Month Grid */}
              <div className="space-y-2">
                <Label>월</Label>
                <div className="grid grid-cols-4 gap-2">
                  {monthNames.map((m, i) => (
                    <Button
                      key={m}
                      variant={birthMonth === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setBirthMonth(i + 1)
                        setBirthDay(Math.min(birthDay, getDaysInMonth(i + 1)))
                      }}
                    >
                      {m}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Day Grid */}
              <div className="space-y-2">
                <Label>일</Label>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: getDaysInMonth(birthMonth) }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={birthDay === i + 1 ? "default" : "outline"}
                      size="sm"
                      className="h-8 text-xs px-0"
                      onClick={() => setBirthDay(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  선택한 생일: <strong className="text-foreground">{birthMonth}월 {birthDay}일</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  생일에는 특별한 선물과 축복이 기다립니다
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("name")} className="flex-1">
                  이전
                </Button>
                <Button onClick={() => setStep("personality")} className="flex-1">
                  다음
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personality Selection */}
        {step === "personality" && !selected && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="text-5xl mb-4">&#x1F52E;</div>
              <CardTitle className="text-2xl font-serif">첫 만남의 순간...</CardTitle>
              <CardDescription>
                당신이 처음 {name}을(를) 보았을 때, 아이는...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {PERSONALITIES.map((personality) => (
                <button
                  key={personality.id}
                  className="w-full text-left p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors bg-transparent"
                  onClick={() => {
                    setSelectedPersonality(personality.id)
                    setStep("confirm")
                  }}
                >
                  <span className="font-semibold text-foreground block mb-1">{personality.name}</span>
                  <span className="text-sm text-muted-foreground leading-relaxed block">
                    {personality.sceneDescription}
                  </span>
                </button>
              ))}

              <Button variant="outline" onClick={() => setStep("birthday")} className="w-full mt-4">
                이전
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Confirm */}
        {(step === "confirm" || (step === "personality" && selected)) && selected && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">&#x1F31F;</div>
              <CardTitle className="text-2xl font-serif">{name}은(는)...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <p className="text-lg font-serif text-primary mb-2">
                  &quot;{selected.name}&quot;
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {selected.description}
                </p>
              </div>

              <div className="p-4 bg-muted/20 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">생일</p>
                <p className="font-semibold">{birthMonth}월 {birthDay}일</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">성격 보너스</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selected.statBonuses).map(([stat, value]) => {
                    const statNames: Record<string, string> = {
                      strength: "체력", intelligence: "지능", charm: "매력",
                      creativity: "예술", morality: "도덕", faith: "신앙",
                      combat: "전투", magic: "마법", cooking: "요리", housework: "가사"
                    }
                    return (
                      <span
                        key={stat}
                        className={cn(
                          "px-2 py-1 rounded text-sm font-medium",
                          (value ?? 0) > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {statNames[stat]} {(value ?? 0) > 0 ? "+" : ""}{value}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPersonality(null)
                    setStep("personality")
                  }}
                  className="flex-1"
                >
                  다시 선택
                </Button>
                <Button onClick={handleConfirm} className="flex-1">
                  모험 시작!
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
