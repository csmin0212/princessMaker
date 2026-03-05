"use client"

import { useState, useEffect } from "react"
import { useGameStore } from "@/lib/game-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    debugJumpTo,
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
                <p>💰 골드: {gold}G</p>
                <p>👤 {character.name} / {character.age}세</p>
              </CardContent>
            </Card>

            {/* 날짜 이동 */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">📅 날짜 이동</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">연차 (1~8)</label>
                    <input type="number" min={1} max={8} value={dbYear}
                      onChange={e => setDbYear(Number(e.target.value))}
                      className="w-full border rounded px-2 py-1.5 text-sm bg-background text-center" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">월 (1~12)</label>
                    <input type="number" min={1} max={12} value={dbMonth}
                      onChange={e => setDbMonth(Number(e.target.value))}
                      className="w-full border rounded px-2 py-1.5 text-sm bg-background text-center" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">주차 (1~4)</label>
                    <input type="number" min={1} max={4} value={dbWeek}
                      onChange={e => setDbWeek(Number(e.target.value))}
                      className="w-full border rounded px-2 py-1.5 text-sm bg-background text-center" />
                  </div>
                </div>
                {/* 빠른 선택 */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">빠른 이동</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "1년차 봄", y:1, m:3, w:1 },
                      { label: "2년차 봄", y:2, m:3, w:1 },
                      { label: "2년차 여름", y:2, m:6, w:1 },
                      { label: "3년차", y:3, m:1, w:1 },
                      { label: "4년차", y:4, m:1, w:1 },
                      { label: "8년차 겨울", y:8, m:12, w:4 },
                    ].map(({ label, y, m, w }) => (
                      <button key={label}
                        onClick={() => { setDbYear(y); setDbMonth(m); setDbWeek(w) }}
                        className="text-xs bg-muted hover:bg-muted/70 rounded px-2 py-1 border">
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleDebugJump} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  🚀 {dbYear}년차 {dbMonth}월 {dbWeek}주차로 이동
                </Button>
              </CardContent>
            </Card>

            {/* 골드 조정 */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">💰 골드 조정</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 items-center">
                  <input type="number" min={0} max={999999} value={dbGold}
                    onChange={e => setDbGold(Number(e.target.value))}
                    className="flex-1 border rounded px-3 py-1.5 text-sm bg-background" />
                  <span className="text-sm text-muted-foreground">G</span>
                  <Button size="sm" variant="outline" onClick={() => { useGameStore.setState({ gold: dbGold }); }}>
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
          </div>
        )}
      </main>
    </div>
  )
}

