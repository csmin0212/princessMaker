"use client"

import { useState } from "react"
import { useGameStore, getDialogueText, OUTFITS } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Topic = "greeting" | "mood" | "dream" | "world" | "love"

const topics: { id: Topic; label: string; icon: string }[] = [
  { id: "greeting", label: "인사하기", icon: "\u{1F44B}" },
  { id: "mood", label: "기분 묻기", icon: "\u{1F60A}" },
  { id: "dream", label: "꿈 이야기", icon: "\u{2B50}" },
  { id: "world", label: "세계에 대해", icon: "\u{1F30D}" },
  { id: "love", label: "사랑 이야기", icon: "\u{1F495}" },
]

const characterVisuals: Record<string, string> = {
  brave: "\u{1F9D2}",
  gentle: "\u{1F467}",
  curious: "\u{1F9D0}",
  mischievous: "\u{1F608}",
  dreamy: "\u{1F31C}",
}

export function TalkScreen() {
  const { character, setScreen } = useGameStore()
  const [currentDialogue, setCurrentDialogue] = useState<string | null>(null)
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  const handleTalk = (topic: Topic) => {
    setIsTyping(true)
    setCurrentTopic(topic)
    setTimeout(() => {
      const dialogue = getDialogueText(character, topic)
      setCurrentDialogue(dialogue)
      setIsTyping(false)
    }, 400)
  }

  const currentOutfit = OUTFITS.find(o => o.id === character.currentOutfit) || OUTFITS[0]
  const visual = characterVisuals[character.personality?.dialogueStyle || "gentle"] || "\u{1F467}"

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold">{character.name}와(과) 대화</h1>
            <p className="text-muted-foreground text-sm">{character.age}세 | {character.personality?.name || "아이"}</p>
          </div>
          <Button variant="outline" onClick={() => setScreen("game")}>
            돌아가기
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Character Portrait */}
          <Card className="border-2">
            <CardContent className="p-8">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center text-8xl">
                    {visual}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-card border-2 flex items-center justify-center text-3xl shadow-lg">
                    {currentOutfit.icon}
                  </div>
                </div>

                <h2 className="text-2xl font-serif font-bold mt-6">{character.name}</h2>
                <p className="text-muted-foreground">{currentOutfit.name}</p>

                {character.personality && (
                  <div className="mt-4 px-4 py-2 bg-primary/10 rounded-full">
                    <span className="text-sm font-medium text-primary">
                      {character.personality.name}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dialogue Area */}
          <div className="space-y-4">
            <Card className={cn(
              "border-2 min-h-[200px] transition-colors",
              currentDialogue ? "border-primary/30 bg-primary/5" : ""
            )}>
              <CardContent className="p-6">
                {isTyping ? (
                  <div className="h-full flex items-center justify-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                ) : currentDialogue ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl flex-shrink-0">
                        {visual}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-primary mb-1">{character.name}</p>
                        <p className="text-lg leading-relaxed">
                          &quot;{currentDialogue}&quot;
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground text-right italic">
                      {currentTopic === "world" && character.worldKnowledge >= 50
                        ? "세계에 대해 많이 알고 있는 것 같습니다..."
                        : currentTopic === "mood" && character.stress > 50
                        ? "조금 지쳐보입니다..."
                        : currentTopic === "love" && character.age >= 16
                        ? "사춘기를 지나며 성숙해졌습니다."
                        : ""}
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>대화 주제를 선택하세요...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Topic Buttons */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">대화 주제</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {topics.map((topic) => (
                    <Button
                      key={topic.id}
                      variant={currentTopic === topic.id ? "default" : "outline"}
                      className="h-auto py-3 flex flex-col gap-1"
                      onClick={() => handleTalk(topic.id)}
                      disabled={isTyping}
                    >
                      <span className="text-xl">{topic.icon}</span>
                      <span className="text-xs">{topic.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Character Status Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <p className="text-muted-foreground">나이</p>
                    <p className="font-bold">{character.age}세</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">스트레스</p>
                    <p className={cn("font-bold", character.stress > 50 ? "text-red-500" : "text-green-500")}>
                      {character.stress}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">세계 이해</p>
                    <p className="font-bold text-cyan-600">{character.worldKnowledge}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
