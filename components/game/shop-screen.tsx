"use client"

import { useState, useEffect } from "react"
import { useGameStore, ITEMS, WEAPONS, OUTFITS, ACCESSORIES, SEASONAL_SHOP_ENTRIES,
         Item, Weapon, Outfit, Accessory } from "@/lib/game-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const rarityColor: Record<string, string> = {
  common: "text-slate-500", uncommon: "text-green-600",
  rare: "text-blue-600",    legendary: "text-yellow-600",
}
const rarityLabel: Record<string, string> = {
  common: "일반", uncommon: "고급", rare: "희귀", legendary: "전설"
}
const rarityBorder: Record<string, string> = {
  common: "border-slate-200", uncommon: "border-green-200",
  rare: "border-blue-200",    legendary: "border-yellow-300",
}
const statLabel: Record<string, string> = {
  strength:"체력", intelligence:"지능", charm:"매력", creativity:"예술",
  morality:"도덕", faith:"신앙", combat:"전투", magic:"마법",
  cooking:"요리", housework:"가사", health:"HP", stress:"스트레스",
}
const seasonLabel: Record<string, string> = { spring:"봄", summer:"여름", fall:"가을", winter:"겨울" }
const seasonIcon:  Record<string, string> = { spring:"🌸", summer:"☀️", fall:"🍂", winter:"❄️" }

function getSeason(month: number) {
  if (month >= 3 && month <= 5) return "spring"
  if (month >= 6 && month <= 8) return "summer"
  if (month >= 9 && month <= 11) return "fall"
  return "winter"
}

export function ShopScreen() {
  const {
    gold, buyItem, buyWeapon, buyOutfit, buyAccessory,
    character, setScreen, month, year, getPerksEffect,
    seasonalShopOutfits, seasonalShopWeapons, seasonalShopAccessories,
    _updateSeasonalShop,
  } = useGameStore()
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    _updateSeasonalShop(month, year)
  }, [month, year])

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 1800)
  }

  // ── 아이템 카드 컴포넌트 ──────────────────────────────────────
  function ItemCard({
    id, name, icon, description, price, rarity, owned, onBuy, seasonal
  }: {
    id: string; name: string; icon: string; description?: string
    price?: number; rarity?: string; owned?: boolean; onBuy: () => void; seasonal?: boolean
  }) {
    const canAfford = !price || gold >= discountedPrice(price)
    return (
      <Card className={cn(
        "border-2 transition-all",
        owned ? "border-green-300 bg-green-50/30"
        : seasonal ? `${rarity ? rarityBorder[rarity] : ""} bg-amber-50/20`
        : rarity ? rarityBorder[rarity] : "border-border",
        !owned && !canAfford && "opacity-55"
      )}>
        <CardContent className="p-3 flex items-center gap-3">
          <span className="text-3xl flex-shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-semibold text-sm">{name}</span>
              {rarity && <span className={cn("text-xs font-medium", rarityColor[rarity])}>[{rarityLabel[rarity]}]</span>}
              {seasonal && <Badge className="text-[10px] bg-amber-500 text-white px-1 py-0">한정</Badge>}
              {owned  && <Badge className="text-[10px] bg-green-600  text-white px-1 py-0">보유</Badge>}
            </div>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <div className="text-right flex-shrink-0">
            {price && (
              <div className="text-sm font-bold mb-1">
                {hasThrifty ? (
                  <span className="text-green-600">🪙 {discountedPrice(price)}G <span className="text-xs line-through text-muted-foreground">{price}G</span></span>
                ) : (
                  <span className="text-amber-600">🪙 {price}G</span>
                )}
              </div>
            )}
            <Button size="sm" disabled={owned || !canAfford} onClick={onBuy} className="h-7 text-xs px-3">
              {owned ? "보유" : !canAfford ? "부족" : "구매"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const season = getSeason(month)
  const hasThrifty = character.unlockedPerks.includes('thrifty')
  const discountedPrice = (price: number) => hasThrifty ? Math.floor(price * 0.9) : price
  const seasonName = seasonLabel[season]
  const seasonIco  = seasonIcon[season]

  // 포션/소모품
  const potions   = ITEMS.filter(i => i.effect.health !== undefined || i.effect.stress !== undefined)
  const statItems = ITEMS.filter(i => i.effect.health === undefined && i.effect.stress === undefined)
  // 상시 무기
  const baseWeapons   = WEAPONS.filter(w => w.price && w.obtainMethod === "상점")
  // 상시 의상
  const baseOutfits   = OUTFITS.filter(o => o.price && !o.obtainMethod.includes("계절") && !o.obtainMethod.includes("연도"))
  // 상시 장신구
  const baseAcc = ACCESSORIES.filter(a => a.price && !a.obtainMethod.includes("계절") && !a.obtainMethod.includes("연도"))

  // 계절/연도 아이템
  const seaOutfits = seasonalShopOutfits.flatMap(id => OUTFITS.find(o => o.id === id) ?? [])
  const seaWeapons = seasonalShopWeapons.flatMap(id => WEAPONS.find(w => w.id === id) ?? [])
  const seaAcc     = seasonalShopAccessories
    .filter(id => !baseAcc.find(a => a.id === id))
    .flatMap(id => ACCESSORIES.find(a => a.id === id) ?? [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏪</span>
            <div>
              <h1 className="text-2xl font-serif font-bold">상점</h1>
              <p className="text-muted-foreground text-sm">{year}년차 · {month}월 · {seasonIco} {seasonName} 시즌</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-lg">
              <span className="text-lg font-semibold">🪙 {gold} G</span>
            </div>
            <Button variant="outline" onClick={() => setScreen("game")}>돌아가기</Button>
          </div>
        </div>

        {/* 알림 */}
        {msg && (
          <div className={cn("mb-4 p-3 rounded-lg text-center text-sm font-medium",
            msg.ok ? "bg-green-50 border border-green-300 text-green-700"
                   : "bg-red-50 border border-red-300 text-red-600")}>
            {msg.text}
          </div>
        )}

        {/* 계절 한정 배너 */}
        {(seaOutfits.length > 0 || seaWeapons.length > 0 || seaAcc.length > 0) && (
          <div className="mb-5 p-3 rounded-xl bg-amber-50 border-2 border-amber-300">
            <div className="text-sm font-bold text-amber-700 mb-2">{seasonIco} {year}년차 {seasonName} 한정 아이템 입고!</div>
            <div className="flex gap-2 flex-wrap text-xs text-amber-600">
              {seaOutfits.map(o => <span key={o.id}>👗 {o.name}</span>)}
              {seaWeapons.map(w => <span key={w.id}>{w.icon} {w.name}</span>)}
              {seaAcc.map(a  => <span key={a.id}>{a.icon} {a.name}</span>)}
            </div>
          </div>
        )}

        <Tabs defaultValue="potion">
          <TabsList className="grid grid-cols-5 mb-5 w-full">
            <TabsTrigger value="potion">🧪 포션</TabsTrigger>
            <TabsTrigger value="stat">⭐ 능력치</TabsTrigger>
            <TabsTrigger value="weapon">⚔️ 무기</TabsTrigger>
            <TabsTrigger value="outfit">👗 의상</TabsTrigger>
            <TabsTrigger value="accessory">💍 장신구</TabsTrigger>
          </TabsList>

          {/* 포션 */}
          <TabsContent value="potion">
            <p className="text-xs text-muted-foreground mb-3">HP 회복 및 스트레스 감소 소모품</p>
            <ScrollArea className="h-[calc(100vh-340px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-2">
                {potions.map(item => {
                  const desc = Object.entries(item.effect).map(([k,v]) => `${statLabel[k]||k} ${(v??0)>0?"+":""}${v}`).join(", ")
                  return <ItemCard key={item.id} id={item.id} name={item.name} icon={item.icon}
                    description={desc} price={item.price}
                    onBuy={() => { const ok = buyItem(item); flash(ok ? `${item.name} 구매!` : "골드 부족", ok) }} />
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 능력치 */}
          <TabsContent value="stat">
            <p className="text-xs text-muted-foreground mb-3">사용 시 능력치 영구 증가</p>
            <ScrollArea className="h-[calc(100vh-340px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-2">
                {statItems.map(item => {
                  const desc = Object.entries(item.effect).map(([k,v]) => `${statLabel[k]||k} +${v}`).join(", ")
                  return <ItemCard key={item.id} id={item.id} name={item.name} icon={item.icon}
                    description={desc} price={item.price}
                    onBuy={() => { const ok = buyItem(item); flash(ok ? `${item.name} 구매!` : "골드 부족", ok) }} />
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 무기 */}
          <TabsContent value="weapon">
            <p className="text-xs text-muted-foreground mb-3">던전 전투용 무기. 옷장에서 장착하세요.</p>
            <ScrollArea className="h-[calc(100vh-340px)]">
              <div className="space-y-4 pr-2">
                {/* 계절/연도 한정 */}
                {seaWeapons.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-amber-600 mb-2">{seasonIco} 시즌 한정</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {seaWeapons.map(w => {
                        const owned = character.ownedWeapons.includes(w.id)
                        const desc = [w.attackBonus > 0 && `공격 +${w.attackBonus}`, w.magicAttackBonus > 0 && `마법 +${w.magicAttackBonus}`, w.critChance && `치명타 +${Math.round(w.critChance*100)}%`].filter(Boolean).join(" · ")
                        return <ItemCard key={w.id} id={w.id} name={w.name} icon={w.icon} description={desc}
                          price={w.price} rarity={w.rarity} owned={owned} seasonal
                          onBuy={() => { if (!w.price) return; const ok = buyWeapon(w.id, w.price); flash(ok ? `${w.name} 구매!` : owned ? "이미 보유" : "골드 부족", ok) }} />
                      })}
                    </div>
                  </div>
                )}
                {/* 상시 */}
                <div>
                  <div className="text-xs font-bold text-muted-foreground mb-2">상시 판매</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {baseWeapons.map(w => {
                      const owned = character.ownedWeapons.includes(w.id)
                      const desc = [w.attackBonus > 0 && `공격 +${w.attackBonus}`, w.magicAttackBonus > 0 && `마법 +${w.magicAttackBonus}`, w.critChance && `치명타 +${Math.round(w.critChance*100)}%`].filter(Boolean).join(" · ")
                      return <ItemCard key={w.id} id={w.id} name={w.name} icon={w.icon} description={desc}
                        price={w.price} rarity={w.rarity} owned={owned}
                        onBuy={() => { if (!w.price) return; const ok = buyWeapon(w.id, w.price); flash(ok ? `${w.name} 구매!` : owned ? "이미 보유" : "골드 부족", ok) }} />
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 의상 */}
          <TabsContent value="outfit">
            <p className="text-xs text-muted-foreground mb-3">착용 시 능력치 보너스. 옷장에서 변경하세요.</p>
            <ScrollArea className="h-[calc(100vh-340px)]">
              <div className="space-y-4 pr-2">
                {seaOutfits.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-amber-600 mb-2">{seasonIco} 시즌 한정</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {seaOutfits.map(o => {
                        const owned = character.ownedOutfits.includes(o.id)
                        const desc = o.statBonuses ? Object.entries(o.statBonuses).map(([k,v]) => `${statLabel[k]||k} +${v}`).join(" · ") : "보너스 없음"
                        return <ItemCard key={o.id} id={o.id} name={o.name} icon={o.icon} description={desc}
                          price={o.price} rarity={o.rarity} owned={owned} seasonal
                          onBuy={() => { if (!o.price) return; const ok = buyOutfit(o.id, o.price); flash(ok ? `${o.name} 구매!` : owned ? "이미 보유" : "골드 부족", ok) }} />
                      })}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-muted-foreground mb-2">상시 판매</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {baseOutfits.map(o => {
                      const owned = character.ownedOutfits.includes(o.id)
                      const desc = o.statBonuses ? Object.entries(o.statBonuses).map(([k,v]) => `${statLabel[k]||k} +${v}`).join(" · ") : "보너스 없음"
                      return <ItemCard key={o.id} id={o.id} name={o.name} icon={o.icon} description={desc}
                        price={o.price} rarity={o.rarity} owned={owned}
                        onBuy={() => { if (!o.price) return; const ok = buyOutfit(o.id, o.price); flash(ok ? `${o.name} 구매!` : owned ? "이미 보유" : "골드 부족", ok) }} />
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 장신구 */}
          <TabsContent value="accessory">
            <p className="text-xs text-muted-foreground mb-3">최대 2개 장착. 옷장에서 착용·해제하세요.</p>
            <ScrollArea className="h-[calc(100vh-340px)]">
              <div className="space-y-4 pr-2">
                {seaAcc.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-amber-600 mb-2">{seasonIco} 시즌 한정</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {seaAcc.map(a => {
                        const owned = character.ownedAccessories.includes(a.id)
                        const desc = Object.entries(a.effect).map(([k,v]) => {
                          if (k === "critChance") return `치명타 +${Math.round((v as number)*100)}%`
                          if (k === "goldMultiplier") return `골드 +${Math.round((v as number)*100)}%`
                          if (k === "stressReduce") return `스트레스 감소 +${Math.round((v as number)*100)}%`
                          if (k === "xpBonus") return `경험치 +${Math.round((v as number)*100)}%`
                          return `${k==="hpBonus"?"최대HP":k==="attackBonus"?"공격":k==="magicBonus"?"마법":k==="defenseBonus"?"방어":k} +${v}`
                        }).join(" · ")
                        return <ItemCard key={a.id} id={a.id} name={a.name} icon={a.icon} description={desc}
                          price={a.price} rarity={a.rarity} owned={owned} seasonal
                          onBuy={() => { if (!a.price) return; const ok = buyAccessory(a.id, a.price); flash(ok ? `${a.name} 구매!` : owned ? "이미 보유" : "골드 부족", ok) }} />
                      })}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-muted-foreground mb-2">상시 판매</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {baseAcc.map(a => {
                      const owned = character.ownedAccessories.includes(a.id)
                      const desc = Object.entries(a.effect).map(([k,v]) => {
                        if (k === "critChance") return `치명타 +${Math.round((v as number)*100)}%`
                        if (k === "goldMultiplier") return `골드 +${Math.round((v as number)*100)}%`
                        if (k === "stressReduce") return `스트레스 감소 +${Math.round((v as number)*100)}%`
                        if (k === "xpBonus") return `경험치 +${Math.round((v as number)*100)}%`
                        return `${k==="hpBonus"?"최대HP":k==="attackBonus"?"공격":k==="magicBonus"?"마법":k==="defenseBonus"?"방어":k} +${v}`
                      }).join(" · ")
                      return <ItemCard key={a.id} id={a.id} name={a.name} icon={a.icon} description={desc}
                        price={a.price} rarity={a.rarity} owned={owned}
                        onBuy={() => { if (!a.price) return; const ok = buyAccessory(a.id, a.price); flash(ok ? `${a.name} 구매!` : owned ? "이미 보유" : "골드 부족", ok) }} />
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
