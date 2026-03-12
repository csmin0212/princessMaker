"use client"

import { useState, useEffect } from "react"
import { useGameStore, ITEMS, Item } from "@/lib/game-store"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// 방랑상인이 취급하는 포션 ID 목록 (health / stress 효과가 있는 아이템)
const MERCHANT_ITEMS: Item[] = ITEMS.filter(
  i => i.effect.health !== undefined || i.effect.stress !== undefined,
)

const statLabel: Record<string, string> = {
  health: "HP", stress: "스트레스",
  strength: "체력", intelligence: "지능", charm: "매력",
  creativity: "예술", morality: "도덕", faith: "신앙",
  combat: "전투", magic: "마법", cooking: "요리", housework: "가사",
}

// ── 인라인 수량 선택 ────────────────────────────────────────────────────────
function MerchantItemRow({
  item, gold, discountedPrice, onBuy,
}: {
  item: Item
  gold: number
  discountedPrice: (p: number) => number
  onBuy: (item: Item, qty: number) => void
}) {
  const [qty, setQty] = useState(1)
  const unitPrice = discountedPrice(item.price)
  const totalCost = unitPrice * qty
  const maxAffordable = Math.max(1, Math.floor(gold / unitPrice))
  const canAfford = gold >= totalCost

  const desc = Object.entries(item.effect)
    .map(([k, v]) => `${statLabel[k] ?? k} ${(v ?? 0) > 0 ? "+" : ""}${v}`)
    .join(", ")

  return (
    <Card className={cn("border transition-all", !canAfford && "opacity-55")}>
      <CardContent className="p-3 flex items-center gap-3">
        {/* 아이콘 */}
        <span className="text-3xl flex-shrink-0">{item.icon}</span>

        {/* 설명 */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{item.name}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>

        {/* 수량 조절 + 구매 */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button variant="outline" size="sm" className="w-7 h-7 p-0 text-base"
            onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</Button>
          <span className="w-6 text-center font-bold text-sm">{qty}</span>
          <Button variant="outline" size="sm" className="w-7 h-7 p-0 text-base"
            onClick={() => setQty(q => Math.min(maxAffordable, q + 1))} disabled={qty >= maxAffordable}>＋</Button>

          <div className="text-right ml-1 min-w-[70px]">
            <div className={cn("text-xs font-bold", canAfford ? "text-amber-600" : "text-red-500")}>
              🪙 {totalCost}G
            </div>
            <Button size="sm" className="h-7 text-xs px-3 mt-0.5 w-full"
              disabled={!canAfford}
              onClick={() => { onBuy(item, qty); setQty(1) }}>
              구매
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── 방랑상인 팝업 메인 ──────────────────────────────────────────────────────
export function WanderingMerchantPopup() {
  const {
    wanderingMerchantActive, wanderingMerchantOpen, dismissWanderingMerchant,
    buyItem, gold, character, month, year,
  } = useGameStore()

  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (!wanderingMerchantOpen) setMsg(null)
  }, [wanderingMerchantOpen])

  if (!wanderingMerchantActive) return null

  const hasThrifty = character.unlockedPerks.includes("thrifty")
  const discountedPrice = (p: number) => hasThrifty ? Math.floor(p * 0.9) : p

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 1800)
  }

  const handleBuy = (item: Item, qty: number) => {
    const ok = buyItem(item, qty)
    flash(ok ? `${item.name} ${qty}개 구매!` : "골드 부족", ok)
  }

  return (
    <Dialog open={wanderingMerchantOpen} onOpenChange={v => { if (!v) dismissWanderingMerchant() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-5xl">🧙</span>
            <div>
              <DialogTitle className="text-xl font-serif">방랑상인 방문!</DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                {year}년차 {month}월 · 이번 주만 머무릅니다
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 대사 */}
        <div className="bg-muted/40 rounded-lg px-4 py-3 text-sm italic text-muted-foreground border">
          "어서오세요, 아가씨. 먼 길을 돌아다니며 모은 귀한 약초와 물약을 팔고 있습죠. 필요하신 만큼 가져가세요~"
        </div>

        {/* 알림 */}
        {msg && (
          <div className={cn(
            "px-3 py-2 rounded-lg text-sm font-medium text-center",
            msg.ok ? "bg-green-50 border border-green-300 text-green-700"
                   : "bg-red-50 border border-red-300 text-red-600",
          )}>
            {msg.text}
          </div>
        )}

        {/* 보유 골드 */}
        <div className="flex justify-end">
          <div className="bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-lg text-sm font-semibold">
            🪙 {gold} G
          </div>
        </div>

        {/* 아이템 목록 */}
        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
          {MERCHANT_ITEMS.map(item => (
            <MerchantItemRow
              key={item.id}
              item={item}
              gold={gold}
              discountedPrice={discountedPrice}
              onBuy={handleBuy}
            />
          ))}
        </div>

        {hasThrifty && (
          <p className="text-xs text-green-600 text-center">✂️ 알뜰살뜰 특성으로 10% 할인 적용 중</p>
        )}

        <Button variant="outline" className="w-full" onClick={dismissWanderingMerchant}>
          오늘은 여기까지! (닫기)
        </Button>
      </DialogContent>
    </Dialog>
  )
}
