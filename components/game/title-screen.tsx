"use client"

import { useState, useEffect } from "react"
import { useGameStore, SaveSlot } from "@/lib/game-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function TitleScreen() {
  const { setScreen, getSaveSlots, loadGame, deleteSave, unlockedEndings } = useGameStore()
  const [slots, setSlots] = useState<SaveSlot[]>([])
  const [showLoad, setShowLoad] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [loadMsg, setLoadMsg] = useState<string | null>(null)

  useEffect(() => {
    setSlots(getSaveSlots())
  }, [showLoad])

  const handleLoad = (key: string) => {
    const ok = loadGame(key)
    if (!ok) setLoadMsg("불러오기에 실패했습니다.")
  }

  const handleDelete = (key: string) => {
    deleteSave(key)
    setSlots(getSaveSlots())
    setDeleteConfirm(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-8">

        {/* Title */}
        <div className="text-center space-y-4">
          <div className="text-7xl mb-4">✨</div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
            별빛의 후예
          </h1>
          <p className="text-lg text-muted-foreground">
            당신의 선택이 아이의 미래를 결정합니다
          </p>
          {unlockedEndings.length > 0 && (
            <p className="text-sm text-primary/70">
              📖 엔딩 {unlockedEndings.length}개 수집됨
            </p>
          )}
        </div>

        {/* Buttons */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardContent className="p-6 space-y-3">
            <Button
              size="lg"
              onClick={() => setScreen("character-creation")}
              className="w-full"
            >
              🌱 새 게임
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowLoad(true)}
              className="w-full"
            >
              💾 불러오기
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setScreen("ending-book")}
              className="w-full"
            >
              📖 엔딩 도감
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 불러오기 다이얼로그 */}
      <Dialog open={showLoad} onOpenChange={setShowLoad}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-serif text-lg">💾 저장 파일 불러오기</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            이어서 플레이할 저장 파일을 선택하세요
          </DialogDescription>

          {loadMsg && (
            <p className="text-sm text-red-500">{loadMsg}</p>
          )}

          {slots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📭</div>
              <p>저장된 파일이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {slots.map(slot => (
                <div
                  key={slot.key}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/30 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{slot.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {slot.characterName} · {slot.age}세 · {slot.year}년 {slot.month}월
                    </div>
                    <div className="text-xs text-muted-foreground/60">{slot.savedAt}</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" onClick={() => handleLoad(slot.key)}>
                      불러오기
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-red-500"
                      onClick={() => setDeleteConfirm(slot.key)}
                    >
                      🗑
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-xs">
          <DialogTitle>저장 파일 삭제</DialogTitle>
          <DialogDescription>이 저장 파일을 삭제하시겠습니까? 되돌릴 수 없습니다.</DialogDescription>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
