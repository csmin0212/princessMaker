"use client"

import { useState, useEffect } from "react"
import { useGameStore, NPCS } from "@/lib/game-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// ── 오디오 설정은 localStorage에 저장 ────────────────────────────
const LS_AUDIO = "princess_audio_settings"

interface AudioSettings {
  masterVolume: number
  bgmVolume: number
  sfxVolume: number
  bgmEnabled: boolean
  sfxEnabled: boolean
}

function loadAudioSettings(): AudioSettings {
  if (typeof window === "undefined") return { masterVolume: 0.8, bgmVolume: 0.7, sfxVolume: 0.8, bgmEnabled: true, sfxEnabled: true }
  try {
    const raw = localStorage.getItem(LS_AUDIO)
    if (raw) return { ...{ masterVolume: 0.8, bgmVolume: 0.7, sfxVolume: 0.8, bgmEnabled: true, sfxEnabled: true }, ...JSON.parse(raw) }
  } catch {}
  return { masterVolume: 0.8, bgmVolume: 0.7, sfxVolume: 0.8, bgmEnabled: true, sfxEnabled: true }
}
function saveAudioSettings(s: AudioSettings) {
  try { localStorage.setItem(LS_AUDIO, JSON.stringify(s)) } catch {}
}
export function getAudioSettings(): AudioSettings { return loadAudioSettings() }

function VolumeSlider({ label, value, onChange, disabled }: {
  label: string; value: number; onChange: (v: number) => void; disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-24 shrink-0 text-muted-foreground">{label}</span>
      <input type="range" min={0} max={1} step={0.05} value={value} disabled={disabled}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-primary disabled:opacity-40" />
      <span className="text-sm w-10 text-right tabular-nums">{Math.round(value * 100)}%</span>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────
export function SettingsScreen() {
  const {
    setScreen, prevScreen, saveGame, loadGame, getSaveSlots, deleteSave,
    gameStarted, character, resetGame, year, month, week, gold,
    debugJumpTo, debugFireEvent, debugSetStat,
  } = useGameStore()

  const [audio, setAudio] = useState<AudioSettings>(loadAudioSettings)
  const [saveSlots, setSaveSlots] = useState(() => getSaveSlots())
  const [saveInput, setSaveInput] = useState("")
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<"audio" | "save" | "debug">("audio")

  // 디버그 상태
  const [dbYear,  setDbYear]  = useState(year)
  const [dbMonth, setDbMonth] = useState(month)
  const [dbWeek,  setDbWeek]  = useState(week)
  const [dbGold,  setDbGold]  = useState(gold)

  useEffect(() => {
    setDbYear(year); setDbMonth(month); setDbWeek(week); setDbGold(gold)
  }, [year, month, week, gold])

  const updateAudio = (patch: Partial<AudioSettings>) => {
    const next = { ...audio, ...patch }
    setAudio(next); saveAudioSettings(next)
  }

  const handleSave = () => {
    const name = saveInput.trim() || `${character.name} 저장`
    saveGame(name); setSaveInput(""); setSaveSlots(getSaveSlots())
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }
  const handleLoad = (key: string) => { if (loadGame(key)) setScreen("game") }
  const handleDelete = (key: string) => {
    if (!confirm("이 저장 데이터를 삭제하시겠습니까?")) return
    deleteSave(key); setSaveSlots(getSaveSlots())
  }
  const handleTitle = () => {
    if (!confirm("타이틀로 돌아가시겠습니까?\n저장하지 않은 진행 내용은 사라집니다.")) return
    resetGame()
  }

  const handleDebugJump = () => {
    debugJumpTo(dbYear, dbMonth, dbWeek)
    setScreen(prevScreen ?? "game" as any)
  }

  const back = () => setScreen((prevScreen as any) ?? "game")

  const SEASONS: Record<number, string> = { 3:"🌸봄", 4:"🌸봄", 5:"🌸봄", 6:"☀️여름", 7:"☀️여름", 8:"☀️여름", 9:"🍂가을", 10:"🍂가을", 11:"🍂가을", 12:"❄️겨울", 1:"❄️겨울", 2:"❄️겨울" }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={back}>← 돌아가기</Button>
          <span className="font-serif font-bold">⚙️ 설정</span>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-4">
        {/* 탭 */}
        <div className="flex gap-2">
          <Button variant={tab === "audio" ? "default" : "outline"} size="sm" onClick={() => setTab("audio")} className="flex-1">🔊 음향</Button>
          <Button variant={tab === "save"  ? "default" : "outline"} size="sm" onClick={() => setTab("save")}  className="flex-1">💾 저장</Button>
          <Button variant={tab === "debug" ? "default" : "outline"} size="sm" onClick={() => setTab("debug")} className="flex-1 text-orange-600 border-orange-300">🛠️ 디버그</Button>
        </div>

        {/* ── 음향 설정 ── */}
        {tab === "audio" && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">음향 설정</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <VolumeSlider label="전체 볼륨" value={audio.masterVolume} onChange={v => updateAudio({ masterVolume: v })} />
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">배경음악 (BGM)</span>
                  <button onClick={() => updateAudio({ bgmEnabled: !audio.bgmEnabled })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${audio.bgmEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${audio.bgmEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <VolumeSlider label="BGM 볼륨" value={audio.bgmVolume} onChange={v => updateAudio({ bgmVolume: v })} disabled={!audio.bgmEnabled} />
              </div>
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">효과음 (SFX)</span>
                  <button onClick={() => updateAudio({ sfxEnabled: !audio.sfxEnabled })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${audio.sfxEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${audio.sfxEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <VolumeSlider label="효과음 볼륨" value={audio.sfxVolume} onChange={v => updateAudio({ sfxVolume: v })} disabled={!audio.sfxEnabled} />
              </div>
              <p className="text-xs text-muted-foreground pt-2">* 실제 오디오 파일이 연동되면 이 설정이 적용됩니다.</p>
            </CardContent>
          </Card>
        )}

        {/* ── 저장 / 불러오기 ── */}
        {tab === "save" && (
          <div className="space-y-4">
            {gameStarted && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">현재 게임 저장</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <input type="text" value={saveInput} onChange={e => setSaveInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSave()}
                      placeholder={`${character.name} - 현재 상태`}
                      className="flex-1 text-sm border rounded px-3 py-1.5 bg-background" maxLength={30} />
                    <Button size="sm" onClick={handleSave}>{saved ? "✅ 저장됨" : "💾 저장"}</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">저장 슬롯</CardTitle></CardHeader>
              <CardContent>
                {saveSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">저장된 데이터가 없습니다.</p>
                ) : (
                  <div className="space-y-2">
                    {saveSlots.map(slot => (
                      <div key={slot.key} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{slot.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {slot.savedAt ? new Date(slot.savedAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => handleLoad(slot.key)}>불러오기</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs shrink-0 text-destructive hover:text-destructive" onClick={() => handleDelete(slot.key)}>삭제</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {gameStarted && (
              <Button variant="outline" className="w-full text-muted-foreground" onClick={handleTitle}>
                🏠 타이틀 화면으로 돌아가기
              </Button>
            )}
          </div>
        )}

        {/* ── 디버그 ── */}
        {tab === "debug" && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-xs text-orange-700">
              ⚠️ 디버그 모드입니다. 게임 진행에 직접 영향을 줍니다.
            </div>

            {/* 현재 상태 */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">현재 상태</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1 text-muted-foreground">
                <p>📅 {year}년차 {month}월 {week}주차 {SEASONS[month]}</p>
                <p>💰 골드: {gold}G · 👤 {character.name} / {character.age}세</p>
              </CardContent>
            </Card>

            {/* ── 날짜 이동 ── */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">📅 날짜 이동</CardTitle></CardHeader>
              <CardContent className="space-y-4">

                {/* 연차 슬라이더 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-muted-foreground">연차</label>
                    <span className="text-sm font-bold tabular-nums">{dbYear}년차 (만 {9 + dbYear}세)</span>
                  </div>
                  <input type="range" min={1} max={8} step={1} value={dbYear}
                    onChange={e => setDbYear(Number(e.target.value))}
                    className="w-full accent-orange-500" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    {[1,2,3,4,5,6,7,8].map(y => (
                      <span key={y} className={cn(y === dbYear && "text-orange-600 font-bold")}>{y}</span>
                    ))}
                  </div>
                </div>

                {/* 월 그리드 – 이벤트 월 강조 */}
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">
                    월 &nbsp;
                    <span className="inline-flex gap-2 text-[10px]">
                      <span className="text-violet-600">■ 축제월</span>
                      <span className="text-blue-600">■ 이벤트월</span>
                    </span>
                  </label>
                  <div className="grid grid-cols-6 gap-1">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => {
                      const isFestival = [3,6,9,12].includes(m)
                      const isEvent    = [1,4,7,10].includes(m)
                      const selected   = m === dbMonth
                      return (
                        <button key={m} onClick={() => setDbMonth(m)}
                          className={cn(
                            "rounded py-1.5 text-xs font-medium border transition-all",
                            selected
                              ? "bg-orange-500 text-white border-orange-500"
                              : isFestival
                                ? "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100"
                                : isEvent
                                  ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                  : "bg-muted/40 border-border hover:bg-muted"
                          )}>
                          {m}월
                          {isFestival && !selected && <span className="block text-[9px] leading-none text-violet-500">축제</span>}
                          {isEvent    && !selected && <span className="block text-[9px] leading-none text-blue-500">이벤트</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 주차 */}
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">주차</label>
                  <div className="flex gap-2">
                    {[1,2,3,4].map(w => (
                      <button key={w} onClick={() => setDbWeek(w)}
                        className={cn(
                          "flex-1 rounded py-1.5 text-sm font-medium border transition-all",
                          w === dbWeek ? "bg-orange-500 text-white border-orange-500" : "bg-muted/40 border-border hover:bg-muted"
                        )}>
                        {w}주
                      </button>
                    ))}
                  </div>
                </div>

                {/* 이동 버튼 */}
                <Button onClick={handleDebugJump} className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2">
                  🚀 {dbYear}년차 {dbMonth}월 {dbWeek}주차로 이동
                </Button>

                {/* 이벤트 발동 */}
                <div className="border-t pt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    현재 위치({month}월)의 이벤트를 즉시 발동합니다.
                    {[3,6,9,12].includes(month) && <span className="text-violet-600 ml-1">→ 축제 이벤트</span>}
                    {[1,4,7,10].includes(month) && <span className="text-blue-600 ml-1">→ 계절 이벤트</span>}
                    {![1,3,4,6,7,9,10,12].includes(month) && <span className="text-muted-foreground ml-1">→ 이벤트 없는 달</span>}
                  </p>
                  <Button variant="outline" onClick={() => { debugFireEvent(); setScreen((prevScreen as any) ?? "game") }}
                    className="w-full border-violet-300 text-violet-700 hover:bg-violet-50 gap-2">
                    🎉 현재 월 이벤트 즉시 발동
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ── 골드 조정 ── */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">💰 골드 조정</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 items-center">
                  <input type="number" min={0} max={999999} value={dbGold}
                    onChange={e => setDbGold(Number(e.target.value))}
                    className="flex-1 border rounded px-3 py-1.5 text-sm bg-background" />
                  <span className="text-sm text-muted-foreground">G</span>
                  <Button size="sm" variant="outline" onClick={() => { useGameStore.setState({ gold: dbGold }) }}>
                    설정
                  </Button>
                </div>
                <div className="flex gap-2">
                  {[100, 500, 1000, 5000].map(v => (
                    <button key={v} onClick={() => { const ng = gold + v; useGameStore.setState({ gold: ng }); setDbGold(ng) }}
                      className="flex-1 text-xs bg-muted hover:bg-muted/70 rounded px-2 py-1 border">
                      +{v}G
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── NPC 호감도 조정 ── */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">💗 NPC 호감도</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {NPCS.map(npc => {
                  const aff = character.npcAffection[npc.id] || 0
                  return (
                    <div key={npc.id} className="flex items-center gap-2">
                      <span className="text-lg w-7 text-center flex-shrink-0">{npc.icon}</span>
                      <span className="text-xs w-14 shrink-0 truncate">{npc.name}</span>
                      <input type="range" min={0} max={100} step={5} value={aff}
                        onChange={e => useGameStore.setState(s => ({
                          character: { ...s.character, npcAffection: { ...s.character.npcAffection, [npc.id]: Number(e.target.value) } }
                        }))}
                        className="flex-1 accent-rose-400" />
                      <span className="text-xs w-8 text-right tabular-nums text-rose-500">{aff}</span>
                    </div>
                  )
                })}
                <Button size="sm" variant="outline" className="w-full text-xs mt-2"
                  onClick={() => {
                    const maxAff = Object.fromEntries(NPCS.map(n => [n.id, 100]))
                    useGameStore.setState(s => ({ character: { ...s.character, npcAffection: maxAff } }))
                  }}>
                  전체 호감도 MAX
                </Button>
              </CardContent>
            </Card>

            {/* ── 스탯 조정 ── */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">📊 스탯 조정</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(["strength","intelligence","charm","creativity","morality","faith","combat","magic","cooking","housework"] as const).map(stat => {
                  const val = character.stats[stat] || 0
                  const labels: Record<string, string> = {
                    strength:"체력", intelligence:"지능", charm:"매력", creativity:"예술",
                    morality:"도덕", faith:"신앙", combat:"전투", magic:"마법", cooking:"요리", housework:"가사"
                  }
                  return (
                    <div key={stat} className="flex items-center gap-2">
                      <span className="text-xs w-10 shrink-0 text-muted-foreground">{labels[stat]}</span>
                      <input type="range" min={0} max={500} step={10} value={val}
                        onChange={e => debugSetStat(stat, Number(e.target.value))}
                        className="flex-1 accent-primary" />
                      <span className="text-xs w-8 text-right tabular-nums">{val}</span>
                    </div>
                  )
                })}
                <Button size="sm" variant="outline" className="w-full text-xs mt-1"
                  onClick={() => {
                    const maxStats = Object.fromEntries(
                      ["strength","intelligence","charm","creativity","morality","faith","combat","magic","cooking","housework"].map(s => [s, 300])
                    )
                    useGameStore.setState(s => ({ character: { ...s.character, stats: { ...s.character.stats, ...maxStats } } }))
                  }}>
                  전체 스탯 300으로 설정
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

