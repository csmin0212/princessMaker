"use client"

import { useGameStore } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRef, useEffect } from "react"

export function EventLog() {
  const { eventLog } = useGameStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [eventLog])
  
  return (
    <Card className="h-full border-2 border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="py-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span>📜</span> 기록
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-32 px-4 pb-4" ref={scrollRef}>
          <div className="space-y-1.5">
            {eventLog.map((log, index) => (
              <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                {log}
              </p>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
