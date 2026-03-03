import { create } from "zustand"

// Types
export interface Stats {
  strength: number
  intelligence: number
  charm: number
  creativity: number
  morality: number
  faith: number
  combat: number
  magic: number
  cooking: number
  housework: number
}

export interface Personality {
  id: string
  name: string
  description: string
  sceneDescription: string
  statBonuses: Partial<Stats>
  dialogueStyle: "brave" | "gentle" | "curious" | "mischievous" | "dreamy"
}

export interface Outfit {
  id: string
  name: string
  description: string
  icon: string
  category: "daily" | "formal" | "combat" | "special"
  rarity: "common" | "uncommon" | "rare" | "legendary"
  statBonuses?: Partial<Stats>
  obtainMethod: string
}

export interface Character {
  name: string
  age: number
  birthday: { month: number; day: number }
  health: number
  maxHealth: number
  stress: number
  maxStress: number
  stats: Stats
  worldKnowledge: number
  personality: Personality | null
  currentOutfit: string
  ownedOutfits: string[]
  profileImage: string | null
}

export interface EventResult {
  title: string
  description: string
  icon: string
  statChanges?: Partial<Stats>
  goldChange?: number
  healthChange?: number
  stressChange?: number
  worldKnowledgeChange?: number
  outfitReward?: string
}

export interface Item {
  id: string
  name: string
  description: string
  effect: Partial<Stats> & { health?: number; stress?: number }
  price: number
  icon: string
}

export interface InventoryItem extends Item {
  quantity: number
}

export interface Activity {
  id: string
  name: string
  description: string
  category: "study" | "work" | "rest" | "social" | "combat"
  statChanges: Partial<Stats>
  stressChange: number
  goldChange: number
  duration: number
  requirements?: Partial<Stats>
  icon: string
}

export interface AdventureEvent {
  id: string
  title: string
  description: string
  choices: {
    text: string
    requirements?: Partial<Stats>
    outcomes: {
      description: string
      statChanges?: Partial<Stats>
      goldChange?: number
      healthChange?: number
      stressChange?: number
      itemReward?: string
    }
  }[]
}

export interface SeasonalEvent {
  id: string
  season: "spring" | "summer" | "fall" | "winter"
  title: string
  description: string
  choices: {
    text: string
    requirements?: Partial<Stats>
    outcomes: {
      description: string
      statChanges?: Partial<Stats>
      goldChange?: number
      healthChange?: number
      stressChange?: number
      worldKnowledgeChange?: number
      outfitReward?: string
    }
  }[]
}

export interface DungeonEnemy {
  id: string
  name: string
  icon: string
  hp: number
  attack: number
  defense: number
  magicResist: number
  goldReward: number
  expReward: Partial<Stats>
  floorRange: [number, number]
  isBoss?: boolean
}

export interface DungeonEncounter {
  id: string
  type: "enemy" | "merchant" | "fairy" | "treasure" | "rest" | "boss" | "goddess" | "demonking" | "secret"
  title: string
  description: string
  icon: string
  floorRange: [number, number]
  choices?: {
    text: string
    requirements?: Partial<Stats> & { worldKnowledge?: number }
    outcomes: {
      description: string
      statChanges?: Partial<Stats>
      goldChange?: number
      healthChange?: number
      worldKnowledgeChange?: number
      endDungeon?: boolean
      nextFloor?: boolean
      outfitReward?: string
    }
  }[]
}

export interface DungeonState {
  active: boolean
  floor: number
  maxFloorReached: number
  currentHP: number
  maxHP: number
  currentEncounter: DungeonEncounter | null
  currentEnemy: DungeonEnemy | null
  enemyHP: number
  combatLog: string[]
  loot: { gold: number; statGains: Partial<Stats> }
}

export interface Ending {
  id: string
  title: string
  description: string
  requirements: {
    stats?: Partial<Stats>
    minGold?: number
    worldKnowledge?: number
    dungeonFloor?: number
  }
  priority: number
  image: string
  difficulty: 1 | 2 | 3 | 4 | 5
  category: "legend" | "noble" | "combat" | "magic" | "faith" | "art" | "life" | "dark" | "secret"
}

export type GameScreen =
  | "title"
  | "character-creation"
  | "game"
  | "schedule"
  | "adventure"
  | "shop"
  | "inventory"
  | "ending"
  | "dungeon"
  | "seasonal"
  | "talk"
  | "wardrobe"
  | "ending-book"
  | "ending-select"

// 세이브 슬롯
export interface SaveSlot {
  key: string
  name: string
  characterName: string
  age: number
  year: number
  month: number
  savedAt: string
}

// 주간 스케줄
export type DayResult = {
  day: number
  activityId: string | null
  activityName: string
  activityIcon: string
  result: 'success' | 'great' | 'fail' | 'birthday' | 'event' | 'empty'
  resultLabel: string
  statChanges?: Partial<Stats>
  goldChange?: number
  stressChange?: number
  eventTitle?: string
}

interface GameState {
  screen: GameScreen
  character: Character
  gold: number
  year: number
  month: number
  week: number
  day: number          // 현재 월의 일(1~28)
  weekSchedule: (string | null)[]   // 7일치 activity id
  weekResult: DayResult[] | null    // 실행 결과
  inventory: InventoryItem[]
  currentEvent: AdventureEvent | null
  currentSeasonalEvent: SeasonalEvent | null
  currentEventResult: EventResult | null
  ending: Ending | null
  gameStarted: boolean
  eventLog: string[]
  dungeon: DungeonState
  seasonalEventsTriggered: string[]
  unlockedEndings: string[]

  setScreen: (screen: GameScreen) => void
  startCharacterCreation: (name: string, birthday: { month: number; day: number }) => void
  setPersonality: (personality: Personality) => void
  startGame: (name: string) => void
  resetGame: () => void
  doActivity: (activity: Activity) => void
  goAdventure: () => void
  resolveEvent: (choiceIndex: number) => void
  resolveSeasonalEvent: (choiceIndex: number) => void
  clearEventResult: () => void
  buyItem: (item: Item) => boolean
  useItem: (itemId: string) => boolean
  advanceTime: () => void
  checkEnding: () => Ending | null
  getQualifiedEndings: () => Ending[]
  viewEnding: (endingId: string) => void
  setWeekSchedule: (schedule: (string | null)[]) => void
  executeWeek: () => void
  clearWeekResult: () => void
  saveGame: (slotName: string) => void
  loadGame: (slotKey: string) => boolean
  getSaveSlots: () => SaveSlot[]
  deleteSave: (slotKey: string) => void
  addLog: (message: string) => void
  addOutfit: (outfitId: string) => void
  changeOutfit: (outfitId: string) => void
  buyOutfit: (outfitId: string, price: number) => boolean
  setProfileImage: (url: string) => void
  startDungeon: () => void
  proceedDungeon: () => void
  attackEnemy: () => void
  useMagicAttack: () => void
  fleeDungeon: () => void
  resolveDungeonChoice: (choiceIndex: number) => void
  endDungeon: (success: boolean) => void
}

// Personalities
export const PERSONALITIES: Personality[] = [
  {
    id: "brave",
    name: "용맹한 아이",
    description: "두려움을 모르고 용감하게 앞으로 나아가는 성격",
    sceneDescription: "당신이 눈을 떴을 때, 아이는 높은 절벽 끝에 서서 바람을 맞으며 웃고 있었습니다. 두려움은 없고, 오직 세상을 향한 도전만이 가득합니다.",
    statBonuses: { combat: 10, strength: 5, morality: -5 },
    dialogueStyle: "brave",
  },
  {
    id: "gentle",
    name: "온화한 아이",
    description: "다정하고 남을 배려하는 따뜻한 성격",
    sceneDescription: "당신이 눈을 떴을 때, 아이는 다친 새를 품에 안고 조용히 어루만지고 있었습니다. 그 눈빛에는 깊은 연민과 사랑이 담겨 있습니다.",
    statBonuses: { charm: 8, morality: 8, faith: 4, combat: -5 },
    dialogueStyle: "gentle",
  },
  {
    id: "curious",
    name: "호기심 많은 아이",
    description: "세상의 모든 것이 궁금한 탐구자",
    sceneDescription: "당신이 눈을 떴을 때, 아이는 서재에서 두꺼운 책을 펼치고 골똘히 무언가를 연구하고 있었습니다. 눈동자에는 지식에 대한 갈망이 빛납니다.",
    statBonuses: { intelligence: 10, magic: 5, creativity: 5, strength: -5 },
    dialogueStyle: "curious",
  },
  {
    id: "mischievous",
    name: "장난꾸러기 아이",
    description: "영리하고 재치있지만 말썽을 좋아하는 성격",
    sceneDescription: "당신이 눈을 떴을 때, 아이는 이웃집 과일을 몰래 따먹다 들켜서 도망치고 있었습니다. 그러나 그 발걸음에는 생기와 재치가 넘칩니다.",
    statBonuses: { charm: 5, creativity: 8, intelligence: 5, morality: -8 },
    dialogueStyle: "mischievous",
  },
  {
    id: "dreamy",
    name: "몽상가 아이",
    description: "상상력이 풍부하고 신비로운 것에 끌리는 성격",
    sceneDescription: "당신이 눈을 떴을 때, 아이는 달빛 아래 홀로 앉아 하늘을 바라보며 무언가를 속삭이고 있었습니다. 마치 누군가와 대화하듯이...",
    statBonuses: { magic: 10, creativity: 8, faith: 5, housework: -8 },
    dialogueStyle: "dreamy",
  },
]

// Outfits
export const OUTFITS: Outfit[] = [
  { id: "default", name: "평상복", description: "편안하고 깔끔한 일상복", icon: "\u{1F457}", category: "daily", rarity: "common", obtainMethod: "기본 지급" },
  { id: "apron", name: "앞치마 복장", description: "일할 때 입는 실용적인 복장", icon: "\u{1F45A}", category: "daily", rarity: "common", obtainMethod: "상점 구매 (50G)" },
  { id: "scholar", name: "학자 로브", description: "학문을 연구할 때 입는 로브", icon: "\u{1F97C}", category: "formal", rarity: "uncommon", statBonuses: { intelligence: 3, magic: 2 }, obtainMethod: "상점 구매 (150G)" },
  { id: "knight", name: "견습 기사복", description: "전투 훈련용 갑옷", icon: "\u{1F6E1}\uFE0F", category: "combat", rarity: "uncommon", statBonuses: { combat: 3, strength: 2 }, obtainMethod: "상점 구매 (200G)" },
  { id: "party-dress", name: "파티 드레스", description: "화려한 정장 드레스", icon: "\u{1F458}", category: "formal", rarity: "uncommon", statBonuses: { charm: 5 }, obtainMethod: "상점 구매 (180G)" },
  { id: "priestess", name: "신녀 복장", description: "신성한 의식용 복장", icon: "\u{1F4FF}", category: "formal", rarity: "rare", statBonuses: { faith: 5, morality: 3 }, obtainMethod: "동지 축제 이벤트" },
  { id: "chef", name: "요리사 복장", description: "전문 요리사의 복장", icon: "\u{1F468}\u200D\u{1F373}", category: "daily", rarity: "uncommon", statBonuses: { cooking: 5 }, obtainMethod: "수확제 요리 대회 우승" },
  { id: "flower-crown", name: "꽃의 여왕 드레스", description: "봄 축제 여왕의 특별한 드레스", icon: "\u{1F338}", category: "special", rarity: "rare", statBonuses: { charm: 8, creativity: 3 }, obtainMethod: "꽃축제 꽃꽂이 대회 우승" },
  { id: "swimsuit", name: "해변 원피스", description: "시원하고 경쾌한 여름 복장", icon: "\u{1F459}", category: "daily", rarity: "uncommon", obtainMethod: "바다 축제 수영 대회 우승" },
  { id: "witch", name: "마녀 로브", description: "신비로운 마법사의 로브", icon: "\u{1F9D9}\u200D\u2640\uFE0F", category: "special", rarity: "rare", statBonuses: { magic: 8, intelligence: 3 }, obtainMethod: "던전 마녀의 방 클리어" },
  { id: "holy-knight", name: "성기사 갑옷", description: "성스러운 빛으로 빛나는 갑옷", icon: "\u2694\uFE0F", category: "combat", rarity: "legendary", statBonuses: { combat: 8, faith: 5, morality: 3 }, obtainMethod: "여신과의 만남" },
  { id: "dark-knight", name: "암흑 기사 갑옷", description: "어둠의 힘이 깃든 갑옷", icon: "\u{1F5A4}", category: "combat", rarity: "legendary", statBonuses: { combat: 10, magic: 5, morality: -5 }, obtainMethod: "마왕과의 계약" },
  { id: "celestial", name: "천상의 드레스", description: "세계의 진실을 깨달은 자만이 입을 수 있는 옷", icon: "\u2728", category: "special", rarity: "legendary", statBonuses: { charm: 5, magic: 5, faith: 5, intelligence: 5 }, obtainMethod: "세계의 이해 80% 달성" },
  { id: "birthday-dress", name: "생일 드레스", description: "축하의 기운이 깃든 드레스", icon: "\u{1F382}", category: "special", rarity: "rare", statBonuses: { charm: 4, morality: 2 }, obtainMethod: "생일 이벤트" },
  { id: "dragon-armor", name: "용린 갑옷", description: "드래곤의 비늘로 만든 전설의 갑옷", icon: "\u{1F432}", category: "combat", rarity: "legendary", statBonuses: { combat: 12, strength: 5, magic: 5 }, obtainMethod: "던전 40층 보스 처치" },
  { id: "void-robe", name: "공허의 로브", description: "심연에서 건져올린 무(無)의 옷", icon: "\u{1F30C}", category: "special", rarity: "legendary", statBonuses: { magic: 12, intelligence: 8, faith: -5 }, obtainMethod: "던전 50층 도달" },
]

const initialStats: Stats = {
  strength: 20, intelligence: 20, charm: 20, creativity: 10,
  morality: 30, faith: 10, combat: 5, magic: 5, cooking: 10, housework: 10,
}

const initialCharacter: Character = {
  name: "", age: 10, birthday: { month: 1, day: 1 },
  health: 100, maxHealth: 100, stress: 0, maxStress: 100,
  stats: { ...initialStats }, worldKnowledge: 0,
  personality: null, currentOutfit: "default", ownedOutfits: ["default"],
  profileImage: null,
}

const initialDungeon: DungeonState = {
  active: false, floor: 0, maxFloorReached: 0,
  currentHP: 100, maxHP: 100,
  currentEncounter: null, currentEnemy: null, enemyHP: 0,
  combatLog: [], loot: { gold: 0, statGains: {} },
}

// Activities (same as before)
export const ACTIVITIES: Activity[] = [
  { id: "study-science", name: "과학 공부", description: "과학 서적을 읽고 실험합니다", category: "study", statChanges: { intelligence: 3, creativity: 1 }, stressChange: 5, goldChange: 0, duration: 1, icon: "\u{1F52C}" },
  { id: "study-literature", name: "문학 공부", description: "시와 소설을 읽습니다", category: "study", statChanges: { intelligence: 2, charm: 1, creativity: 2 }, stressChange: 3, goldChange: 0, duration: 1, icon: "\u{1F4DA}" },
  { id: "study-theology", name: "신학 공부", description: "종교와 철학을 배웁니다", category: "study", statChanges: { faith: 3, morality: 2, intelligence: 1 }, stressChange: 4, goldChange: 0, duration: 1, icon: "\u{1F64F}" },
  { id: "study-magic", name: "마법 수업", description: "마법의 기초를 배웁니다", category: "study", statChanges: { magic: 3, intelligence: 1 }, stressChange: 6, goldChange: -30, duration: 1, icon: "\u2728" },
  { id: "study-etiquette", name: "예절 수업", description: "귀족의 예절을 배웁니다", category: "study", statChanges: { charm: 3, morality: 1 }, stressChange: 4, goldChange: -20, duration: 1, icon: "\u{1F380}" },
  { id: "study-art", name: "미술 수업", description: "그림과 조각을 배웁니다", category: "study", statChanges: { creativity: 4, charm: 1 }, stressChange: 2, goldChange: -25, duration: 1, icon: "\u{1F3A8}" },
  { id: "work-farm", name: "농장 일", description: "농장에서 일합니다", category: "work", statChanges: { strength: 2, housework: 1 }, stressChange: 4, goldChange: 30, duration: 1, icon: "\u{1F33E}" },
  { id: "work-inn", name: "여관 일", description: "여관에서 서빙합니다", category: "work", statChanges: { charm: 1, cooking: 2, housework: 1 }, stressChange: 5, goldChange: 40, duration: 1, icon: "\u{1F37D}\uFE0F" },
  { id: "work-church", name: "교회 봉사", description: "교회에서 봉사합니다", category: "work", statChanges: { faith: 2, morality: 2 }, stressChange: 2, goldChange: 15, duration: 1, icon: "\u26EA" },
  { id: "work-hunter", name: "사냥 도우미", description: "사냥꾼을 돕습니다", category: "work", statChanges: { combat: 2, strength: 1 }, stressChange: 6, goldChange: 50, duration: 1, requirements: { strength: 30 }, icon: "\u{1F3F9}" },
  { id: "work-tutor", name: "과외 선생", description: "어린 아이들을 가르칩니다", category: "work", statChanges: { intelligence: 1, charm: 1 }, stressChange: 3, goldChange: 60, duration: 1, requirements: { intelligence: 50 }, icon: "\u{1F468}\u200D\u{1F3EB}" },
  { id: "rest-sleep", name: "휴식", description: "집에서 푹 쉽니다", category: "rest", statChanges: {}, stressChange: -15, goldChange: 0, duration: 1, icon: "\u{1F634}" },
  { id: "rest-walk", name: "산책", description: "마을을 돌아다닙니다", category: "rest", statChanges: { charm: 1 }, stressChange: -8, goldChange: 0, duration: 1, icon: "\u{1F6B6}" },
  { id: "rest-spa", name: "온천", description: "온천에서 피로를 풉니다", category: "rest", statChanges: { charm: 2 }, stressChange: -20, goldChange: -30, duration: 1, icon: "\u2668\uFE0F" },
  { id: "social-friend", name: "친구 만나기", description: "친구들과 시간을 보냅니다", category: "social", statChanges: { charm: 2, morality: 1 }, stressChange: -5, goldChange: -10, duration: 1, icon: "\u{1F46B}" },
  { id: "social-festival", name: "축제 참가", description: "마을 축제에 참가합니다", category: "social", statChanges: { charm: 2, creativity: 1 }, stressChange: -10, goldChange: -20, duration: 1, icon: "\u{1F389}" },
  { id: "combat-training", name: "무술 수련", description: "검술과 무술을 배웁니다", category: "combat", statChanges: { combat: 3, strength: 2 }, stressChange: 8, goldChange: -20, duration: 1, icon: "\u2694\uFE0F" },
  { id: "combat-sparring", name: "모의 전투", description: "다른 수련생과 대련합니다", category: "combat", statChanges: { combat: 4, strength: 1 }, stressChange: 10, goldChange: 0, duration: 1, requirements: { combat: 20 }, icon: "\u{1F93A}" },
  { id: "dungeon-explore", name: "던전 탐험", description: "심연의 던전을 탐험합니다. 일주일이 통째로 소요됩니다.", category: "combat", statChanges: { combat: 3, strength: 2, magic: 1 }, stressChange: 15, goldChange: -20, duration: 7, icon: "\u{1F3F0}" },
]

export const ITEMS: Item[] = [
  { id: "healing-potion", name: "치유 물약", description: "체력을 30 회복합니다", effect: { health: 30 }, price: 50, icon: "\u{1F9EA}" },
  { id: "stress-tea", name: "진정차", description: "스트레스를 20 감소시킵니다", effect: { stress: -20 }, price: 30, icon: "\u{1F375}" },
  { id: "magic-book", name: "마법서", description: "마법 +5", effect: { magic: 5 }, price: 100, icon: "\u{1F4D6}" },
  { id: "strength-ring", name: "힘의 반지", description: "체력 +5", effect: { strength: 5 }, price: 150, icon: "\u{1F48D}" },
  { id: "charm-necklace", name: "매력의 목걸이", description: "매력 +5", effect: { charm: 5 }, price: 120, icon: "\u{1F4FF}" },
  { id: "wisdom-pendant", name: "지혜의 펜던트", description: "지능 +5", effect: { intelligence: 5 }, price: 130, icon: "\u{1F52E}" },
  { id: "art-supplies", name: "화구 세트", description: "예술 +5", effect: { creativity: 5 }, price: 80, icon: "\u{1F58C}\uFE0F" },
  { id: "holy-water", name: "성수", description: "신앙 +3, 도덕 +3", effect: { faith: 3, morality: 3 }, price: 60, icon: "\u{1F4A7}" },
  { id: "combat-manual", name: "무술 교본", description: "전투 +5", effect: { combat: 5 }, price: 110, icon: "\u{1F4D5}" },
  { id: "recipe-book", name: "요리책", description: "요리 +5", effect: { cooking: 5 }, price: 70, icon: "\u{1F4D7}" },
]

// Seasonal Events
export const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: "spring-flower-festival", season: "spring", title: "꽃축제",
    description: "마을 광장에서 성대한 꽃축제가 열립니다. 알록달록한 꽃들이 가득하고, 다양한 행사가 진행됩니다.",
    choices: [
      { text: "꽃꽂이 대회에 참가한다", requirements: { creativity: 40 }, outcomes: { description: "아름다운 꽃꽂이로 대상을 수상했습니다! 꽃의 여왕 드레스를 상으로 받았습니다!", statChanges: { creativity: 4, charm: 2 }, goldChange: 80, outfitReward: "flower-crown" } },
      { text: "꽃을 선물 받는다", outcomes: { description: "누군가가 예쁜 꽃다발을 선물해 주었습니다. 마음이 따뜻해집니다.", statChanges: { charm: 2 }, stressChange: -10 } },
      { text: "신비로운 꽃을 발견한다", requirements: { magic: 40 }, outcomes: { description: "마법이 깃든 희귀한 꽃을 발견했습니다. 이 꽃은 고대의 비밀과 연결되어 있습니다...", statChanges: { magic: 3 }, worldKnowledgeChange: 5 } },
    ],
  },
  {
    id: "spring-planting", season: "spring", title: "파종의 계절",
    description: "농부들이 씨앗을 뿌리는 계절입니다. 마을에서 함께 농사를 돕자는 요청이 왔습니다.",
    choices: [
      { text: "열심히 농사를 돕는다", outcomes: { description: "땀 흘려 일한 대가로 보상을 받았습니다. 성실함을 인정받았습니다!", statChanges: { strength: 2, morality: 2 }, goldChange: 50, stressChange: 5 } },
      { text: "아이들에게 식물 키우기를 가르친다", requirements: { intelligence: 40 }, outcomes: { description: "아이들이 즐거워합니다. 가르치는 보람을 느꼈습니다.", statChanges: { intelligence: 2, charm: 2, morality: 2 } } },
    ],
  },
  {
    id: "summer-beach", season: "summer", title: "바다 축제",
    description: "무더운 여름, 해변에서 축제가 열립니다. 시원한 바닷바람이 불어옵니다.",
    choices: [
      { text: "수영 대회에 참가한다", requirements: { strength: 45 }, outcomes: { description: "멋진 수영 실력으로 우승했습니다! 해변 원피스를 상으로 받았습니다!", statChanges: { strength: 3, combat: 1 }, goldChange: 60, outfitReward: "swimsuit" } },
      { text: "모래성 짓기 대회에 참가한다", outcomes: { description: "창의적인 모래성을 만들었습니다. 즐거운 시간이었어요!", statChanges: { creativity: 3 }, stressChange: -15 } },
      { text: "해변에서 이상한 조개를 발견한다", requirements: { magic: 30 }, outcomes: { description: "조개 속에서 고대 바다 신의 메시지가 담긴 진주를 발견했습니다...", statChanges: { magic: 2, faith: 2 }, worldKnowledgeChange: 8 } },
    ],
  },
  {
    id: "summer-ghost", season: "summer", title: "백중 귀신 이야기",
    description: "여름밤, 마을 사람들이 모여 귀신 이야기를 나눕니다. 등골이 서늘해집니다.",
    choices: [
      { text: "무서운 이야기를 들려준다", requirements: { charm: 35 }, outcomes: { description: "당신의 이야기에 모두가 소름 돋았습니다! 이야기꾼으로 유명해졌어요.", statChanges: { charm: 3, creativity: 2 } } },
      { text: "진짜 귀신을 찾아 나선다", requirements: { combat: 30, faith: 30 }, outcomes: { description: "숲에서 떠도는 영혼을 만났습니다. 그 영혼은 세계의 비밀 일부를 알려주었습니다...", statChanges: { faith: 4, magic: 2 }, worldKnowledgeChange: 10, stressChange: 10 } },
      { text: "무서워서 집에 간다", outcomes: { description: "푹 자고 일어났습니다. 때로는 쉬는 것도 중요하죠.", stressChange: -10 } },
    ],
  },
  {
    id: "fall-harvest", season: "fall", title: "수확제",
    description: "풍성한 수확을 축하하는 축제입니다. 마을 전체가 기쁨에 넘칩니다.",
    choices: [
      { text: "요리 대회에 참가한다", requirements: { cooking: 50 }, outcomes: { description: "맛있는 요리로 대상을 수상했습니다! 요리사 복장을 상으로 받았습니다!", statChanges: { cooking: 4, charm: 2 }, goldChange: 100, outfitReward: "chef" } },
      { text: "추수를 돕는다", outcomes: { description: "열심히 일한 덕분에 보상을 받았습니다. 몸이 건강해진 기분이에요.", statChanges: { strength: 2, housework: 2 }, goldChange: 70 } },
      { text: "고대 수확 의식에 참여한다", requirements: { faith: 50 }, outcomes: { description: "오래된 의식을 통해 대지의 정령과 교감했습니다. 이 세계의 순환에 대해 깊이 이해하게 되었습니다.", statChanges: { faith: 5, magic: 3 }, worldKnowledgeChange: 12 } },
    ],
  },
  {
    id: "fall-moon", season: "fall", title: "보름달 밤",
    description: "크고 밝은 보름달이 떴습니다. 달빛이 세상을 신비롭게 물들입니다.",
    choices: [
      { text: "달을 보며 시를 짓는다", requirements: { creativity: 35 }, outcomes: { description: "아름다운 시가 완성되었습니다. 영감이 샘솟습니다.", statChanges: { creativity: 4, charm: 2 } } },
      { text: "달빛 아래 명상한다", outcomes: { description: "마음이 평온해졌습니다. 내면의 힘이 강해진 것 같아요.", stressChange: -20, statChanges: { faith: 2 } } },
      { text: "달의 마법을 연구한다", requirements: { magic: 50, intelligence: 50 }, outcomes: { description: "달은 단순한 천체가 아닙니다. 고대 여신이 남긴 마법의 거울이며, 세계의 비밀을 비추고 있습니다...", statChanges: { magic: 5, intelligence: 3 }, worldKnowledgeChange: 15 } },
    ],
  },
  {
    id: "winter-snow", season: "winter", title: "첫눈",
    description: "하얀 눈이 세상을 덮었습니다. 아이들이 밖으로 뛰어나갑니다.",
    choices: [
      { text: "눈싸움을 한다", outcomes: { description: "신나게 눈싸움을 했습니다! 친구들과 더 가까워졌어요.", statChanges: { combat: 1, strength: 1 }, stressChange: -15 } },
      { text: "눈사람을 만든다", outcomes: { description: "예쁜 눈사람이 완성되었습니다. 창작의 기쁨을 느꼈어요.", statChanges: { creativity: 2 }, stressChange: -10 } },
      { text: "눈 속에서 빛나는 것을 발견한다", requirements: { magic: 35 }, outcomes: { description: "얼어붙은 요정의 눈물을 발견했습니다. 그 안에 고대의 기억이 담겨 있었습니다...", statChanges: { magic: 3 }, worldKnowledgeChange: 7 } },
    ],
  },
  {
    id: "winter-solstice", season: "winter", title: "동지 축제",
    description: "가장 긴 밤, 사람들이 모여 빛의 귀환을 축하합니다. 신성한 기운이 감돕니다.",
    choices: [
      { text: "성가대에서 노래한다", requirements: { charm: 40 }, outcomes: { description: "아름다운 노래로 모두를 감동시켰습니다. 감사의 선물을 받았어요.", statChanges: { charm: 3, faith: 3 }, goldChange: 50 } },
      { text: "가난한 이웃을 돕는다", outcomes: { description: "따뜻한 마음을 나누었습니다. 진정한 행복을 느꼈어요.", statChanges: { morality: 4, faith: 2 }, goldChange: -30 } },
      { text: "고대 동지 의식에 참여한다", requirements: { faith: 60, magic: 60 }, outcomes: { description: "어둠과 빛의 균형 속에서 세계의 진정한 모습을 보았습니다. 신녀 복장을 하사받았습니다!", statChanges: { faith: 5, magic: 5 }, worldKnowledgeChange: 20, outfitReward: "priestess" } },
    ],
  },
]

// Dungeon Enemies (50 floors)
export const DUNGEON_ENEMIES: DungeonEnemy[] = [
  // Floors 1-10
  { id: "slime", name: "슬라임", icon: "\u{1F7E2}", hp: 30, attack: 8, defense: 2, magicResist: 5, goldReward: 15, expReward: { combat: 1 }, floorRange: [1, 5] },
  { id: "goblin", name: "고블린", icon: "\u{1F47A}", hp: 45, attack: 12, defense: 5, magicResist: 3, goldReward: 25, expReward: { combat: 2, strength: 1 }, floorRange: [1, 8] },
  { id: "wolf", name: "늑대", icon: "\u{1F43A}", hp: 50, attack: 15, defense: 4, magicResist: 2, goldReward: 30, expReward: { combat: 2, strength: 1 }, floorRange: [3, 10] },
  { id: "skeleton", name: "해골 병사", icon: "\u{1F480}", hp: 60, attack: 18, defense: 8, magicResist: 0, goldReward: 40, expReward: { combat: 3 }, floorRange: [5, 15] },
  // Boss Floor 10
  { id: "boss-troll", name: "동굴 트롤", icon: "\u{1F9CC}", hp: 200, attack: 30, defense: 15, magicResist: 10, goldReward: 150, expReward: { combat: 5, strength: 3 }, floorRange: [10, 10], isBoss: true },
  // Floors 11-20
  { id: "orc", name: "오크 전사", icon: "\u{1F479}", hp: 80, attack: 22, defense: 10, magicResist: 5, goldReward: 55, expReward: { combat: 3, strength: 2 }, floorRange: [8, 20] },
  { id: "dark-mage", name: "암흑 마법사", icon: "\u{1F9D9}\u200D\u2642\uFE0F", hp: 55, attack: 25, defense: 3, magicResist: 18, goldReward: 60, expReward: { magic: 3, intelligence: 1 }, floorRange: [10, 25] },
  { id: "gargoyle", name: "가고일", icon: "\u{1F47F}", hp: 90, attack: 20, defense: 18, magicResist: 12, goldReward: 65, expReward: { combat: 3, strength: 2 }, floorRange: [12, 22] },
  // Boss Floor 20
  { id: "boss-hydra", name: "히드라", icon: "\u{1F40D}", hp: 350, attack: 40, defense: 18, magicResist: 15, goldReward: 300, expReward: { combat: 6, magic: 3 }, floorRange: [20, 20], isBoss: true },
  // Floors 21-30
  { id: "minotaur", name: "미노타우로스", icon: "\u{1F402}", hp: 120, attack: 30, defense: 14, magicResist: 8, goldReward: 80, expReward: { combat: 4, strength: 2 }, floorRange: [18, 30] },
  { id: "wraith", name: "망령", icon: "\u{1F47B}", hp: 70, attack: 35, defense: 0, magicResist: 25, goldReward: 90, expReward: { magic: 4, faith: 2 }, floorRange: [20, 32] },
  { id: "golem", name: "골렘", icon: "\u{1FAA8}", hp: 180, attack: 25, defense: 30, magicResist: 5, goldReward: 100, expReward: { combat: 4, strength: 3 }, floorRange: [22, 35] },
  // Boss Floor 30
  { id: "boss-lich", name: "리치", icon: "\u{1F9DF}", hp: 500, attack: 50, defense: 15, magicResist: 30, goldReward: 500, expReward: { magic: 8, intelligence: 5 }, floorRange: [30, 30], isBoss: true },
  // Floors 31-40
  { id: "demon", name: "하급 악마", icon: "\u{1F608}", hp: 150, attack: 40, defense: 20, magicResist: 20, goldReward: 120, expReward: { combat: 5, magic: 3 }, floorRange: [28, 40] },
  { id: "dragon-spawn", name: "드래곤 새끼", icon: "\u{1F432}", hp: 200, attack: 45, defense: 22, magicResist: 25, goldReward: 150, expReward: { combat: 5, magic: 3 }, floorRange: [30, 42] },
  { id: "fallen-angel", name: "타락 천사", icon: "\u{1F607}", hp: 160, attack: 50, defense: 18, magicResist: 30, goldReward: 180, expReward: { faith: 5, magic: 4 }, floorRange: [35, 45] },
  // Boss Floor 40
  { id: "boss-dragon", name: "고대 드래곤", icon: "\u{1F409}", hp: 800, attack: 65, defense: 30, magicResist: 35, goldReward: 800, expReward: { combat: 10, magic: 5, strength: 5 }, floorRange: [40, 40], isBoss: true },
  // Floors 41-50
  { id: "shadow-lord", name: "그림자 군주", icon: "\u{1F311}", hp: 250, attack: 55, defense: 25, magicResist: 30, goldReward: 200, expReward: { combat: 6, magic: 5 }, floorRange: [38, 48] },
  { id: "seraphim", name: "세라핌의 환영", icon: "\u{1F31F}", hp: 300, attack: 60, defense: 20, magicResist: 40, goldReward: 250, expReward: { faith: 6, magic: 5, intelligence: 3 }, floorRange: [42, 50] },
  { id: "void-beast", name: "공허의 야수", icon: "\u{1F30C}", hp: 350, attack: 70, defense: 28, magicResist: 28, goldReward: 300, expReward: { combat: 7, strength: 5 }, floorRange: [45, 50] },
  // Final Boss Floor 50
  { id: "boss-sealed-god", name: "봉인된 신의 파편", icon: "\u{1F4A0}", hp: 1500, attack: 80, defense: 40, magicResist: 40, goldReward: 2000, expReward: { combat: 15, magic: 15, faith: 10, intelligence: 10 }, floorRange: [50, 50], isBoss: true },
]

// Dungeon Encounters
export const DUNGEON_ENCOUNTERS: DungeonEncounter[] = [
  { id: "treasure-chest", type: "treasure", title: "보물 상자", description: "빛나는 보물 상자를 발견했습니다!", icon: "\u{1F4E6}", floorRange: [1, 50],
    choices: [
      { text: "열어본다", outcomes: { description: "금화가 가득합니다! 운이 좋았어요.", goldChange: 50, nextFloor: true } },
      { text: "함정인지 확인한다", requirements: { intelligence: 40 }, outcomes: { description: "함정을 해제하고 더 많은 보물을 발견했습니다!", goldChange: 100, statChanges: { intelligence: 1 }, nextFloor: true } },
    ],
  },
  { id: "healing-spring", type: "rest", title: "치유의 샘", description: "맑은 물이 솟아오르는 신비한 샘을 발견했습니다.", icon: "\u26F2", floorRange: [1, 50],
    choices: [
      { text: "물을 마신다", outcomes: { description: "상처가 치유됩니다! 몸이 가벼워졌어요.", healthChange: 30, nextFloor: true } },
      { text: "샘의 비밀을 탐구한다", requirements: { magic: 50 }, outcomes: { description: "샘은 고대 여신의 눈물로 만들어졌습니다... 귀중한 지식을 얻었어요.", healthChange: 50, worldKnowledgeChange: 5, nextFloor: true } },
    ],
  },
  { id: "merchant", type: "merchant", title: "떠돌이 상인", description: "어두운 던전에서 상인을 만났습니다. '물건 좀 보시게나, 여행자여.'", icon: "\u{1F9D4}", floorRange: [2, 45],
    choices: [
      { text: "치유 물약을 산다 (-30G)", outcomes: { description: "물약을 구매했습니다. 든든하네요.", goldChange: -30, healthChange: 40, nextFloor: true } },
      { text: "정보를 산다 (-50G)", outcomes: { description: "상인이 던전의 비밀 하나를 알려주었습니다...", goldChange: -50, worldKnowledgeChange: 3, nextFloor: true } },
      { text: "그냥 지나간다", outcomes: { description: "상인이 아쉬운 듯 손을 흔듭니다.", nextFloor: true } },
    ],
  },
  { id: "fairy", type: "fairy", title: "비밀의 요정", description: "작은 빛이 어둠 속에서 반짝입니다. 요정입니다! '안녕, 인간 아가씨~'", icon: "\u{1F9DA}", floorRange: [3, 50],
    choices: [
      { text: "이름을 가르쳐준다", outcomes: { description: "요정이 기뻐하며 마법의 축복을 줍니다! '좋은 이름이야~'", statChanges: { magic: 3, charm: 2 }, nextFloor: true } },
      { text: "세계에 대해 묻는다", requirements: { intelligence: 45, magic: 35 }, outcomes: { description: "'이 세계는 꿈으로 만들어졌어. 여신의 꿈과 마왕의 꿈이 얽혀서...' 요정이 속삭입니다.", worldKnowledgeChange: 8, nextFloor: true } },
      { text: "거래를 제안한다", requirements: { charm: 40 }, outcomes: { description: "요정이 마법의 먼지를 주고 당신의 미소를 가져갑니다.", goldChange: 80, statChanges: { charm: -2, magic: 4 }, nextFloor: true } },
    ],
  },
  { id: "ancient-altar", type: "secret", title: "고대의 제단", description: "오래된 제단이 희미하게 빛나고 있습니다. 무언가 새겨져 있습니다...", icon: "\u{1F5FF}", floorRange: [4, 50],
    choices: [
      { text: "기도한다", requirements: { faith: 40 }, outcomes: { description: "평온한 기운이 몸을 감쌉니다. 신의 가호를 받은 것 같아요.", statChanges: { faith: 3, morality: 2 }, healthChange: 20, nextFloor: true } },
      { text: "비문을 해독한다", requirements: { intelligence: 50 }, outcomes: { description: "'빛과 어둠이 하나였을 때, 세계는 완전했다...' 고대의 지식을 얻었습니다!", worldKnowledgeChange: 10, statChanges: { intelligence: 2 }, nextFloor: true } },
      { text: "지나친다", outcomes: { description: "알 수 없는 기운이 느껴져 발걸음을 재촉합니다.", nextFloor: true } },
    ],
  },
  { id: "goddess-vision", type: "goddess", title: "여신의 현현", description: "눈부신 빛 속에서 아름다운 존재가 나타났습니다. '용기 있는 아이여...'", icon: "\u{1F47C}", floorRange: [15, 50],
    choices: [
      { text: "무릎을 꿇고 경배한다", requirements: { faith: 60, morality: 50 }, outcomes: { description: "'너의 순수한 마음을 본다. 이 갑옷을 받아라, 빛의 전사여.' 성기사 갑옷을 받았습니다!", statChanges: { faith: 8, morality: 5 }, worldKnowledgeChange: 15, outfitReward: "holy-knight", nextFloor: true } },
      { text: "세계의 진실을 묻는다", requirements: { intelligence: 60, worldKnowledge: 40 }, outcomes: { description: "'나와 마왕은... 원래 하나였단다. 우리가 갈라진 순간, 이 세계가 태어났지.' 여신이 슬픈 미소를 짓습니다.", worldKnowledgeChange: 25, statChanges: { intelligence: 3, magic: 3 }, nextFloor: true } },
      { text: "도움을 구한다", outcomes: { description: "'힘을 빌려주마...' 여신의 축복이 내립니다.", healthChange: 50, statChanges: { faith: 3 }, nextFloor: true } },
    ],
  },
  { id: "demon-king-shadow", type: "demonking", title: "마왕의 그림자", description: "어둠이 응집됩니다. 거대한 그림자가 당신을 내려다봅니다. '흥미롭군... 인간 아이가.'", icon: "\u{1F608}", floorRange: [20, 50],
    choices: [
      { text: "맞서 싸운다", requirements: { combat: 70, strength: 50 }, outcomes: { description: "'강하군. 마음에 든다.' 마왕이 웃으며 사라집니다.", statChanges: { combat: 5, strength: 3 }, worldKnowledgeChange: 10, nextFloor: true } },
      { text: "거래를 제안한다", requirements: { charm: 50, intelligence: 50 }, outcomes: { description: "'어둠의 힘을 원하나? 좋다, 주지.' 암흑 기사 갑옷을 받았습니다.", statChanges: { combat: 5, magic: 5, morality: -10 }, outfitReward: "dark-knight", worldKnowledgeChange: 15, nextFloor: true } },
      { text: "세계에 대해 묻는다", requirements: { worldKnowledge: 50 }, outcomes: { description: "'여신과 나는 같은 존재였다. 빛과 어둠... 둘 다 필요하지.' 마왕이 사라집니다.", worldKnowledgeChange: 20, statChanges: { magic: 3, intelligence: 3 }, nextFloor: true } },
    ],
  },
  { id: "witch-chamber", type: "treasure", title: "마녀의 방", description: "오래된 마녀의 연구실을 발견했습니다.", icon: "\u{1F52E}", floorRange: [5, 25],
    choices: [
      { text: "마법서를 읽는다", requirements: { magic: 40, intelligence: 40 }, outcomes: { description: "고대 마법의 비밀을 배웠습니다! 마녀 로브도 발견했어요!", statChanges: { magic: 4, intelligence: 2 }, outfitReward: "witch", nextFloor: true } },
      { text: "물약을 마신다", outcomes: { description: "이상한 맛이지만... 힘이 솟아오릅니다!", healthChange: 30, statChanges: { magic: 2 }, nextFloor: true } },
    ],
  },
  // Deep dungeon encounters
  { id: "dragon-hoard", type: "treasure", title: "드래곤의 보물고", description: "산더미처럼 쌓인 보물 위에 드래곤이 잠들어 있습니다...", icon: "\u{1F4B0}", floorRange: [35, 45],
    choices: [
      { text: "조용히 보물만 가져간다", requirements: { charm: 60 }, outcomes: { description: "숨을 죽이고 금화를 챙겼습니다. 드래곤은 여전히 곤히 자고 있네요.", goldChange: 300, nextFloor: true } },
      { text: "드래곤을 깨워 도전한다", requirements: { combat: 80 }, outcomes: { description: "격렬한 전투 끝에 드래곤의 비늘 하나를 빼앗았습니다! 용린 갑옷의 재료입니다!", statChanges: { combat: 5, strength: 3 }, outfitReward: "dragon-armor", goldChange: 200, nextFloor: true } },
      { text: "도망간다", outcomes: { description: "현명한 판단입니다. 목숨이 먼저니까요.", nextFloor: true } },
    ],
  },
  { id: "void-gate", type: "secret", title: "공허의 문", description: "현실의 틈새로 공허가 스며들고 있습니다. 칠흑 같은 어둠 너머로 무언가가 보입니다...", icon: "\u{1F573}\uFE0F", floorRange: [40, 50],
    choices: [
      { text: "문 너머를 들여다본다", requirements: { magic: 80, worldKnowledge: 60 }, outcomes: { description: "세계가 태어나기 전의 공허를 보았습니다. 창조의 비밀... 그 엄청난 지식이 머릿속에 새겨집니다.", worldKnowledgeChange: 20, statChanges: { magic: 5, intelligence: 5 }, nextFloor: true } },
      { text: "공허의 기운을 흡수한다", requirements: { combat: 70, magic: 70 }, outcomes: { description: "어둠의 힘이 몸에 스며듭니다. 공허의 로브가 형체를 이루었습니다!", statChanges: { magic: 8, combat: 5, morality: -5 }, outfitReward: "void-robe", nextFloor: true } },
      { text: "문을 봉인한다", requirements: { faith: 70 }, outcomes: { description: "기도의 힘으로 문을 봉인했습니다. 세계의 균형을 지켰습니다.", statChanges: { faith: 5, morality: 5 }, worldKnowledgeChange: 10, nextFloor: true } },
    ],
  },
  { id: "world-core", type: "secret", title: "세계의 핵심", description: "던전 최심부에 도달했습니다. 빛과 어둠이 소용돌이치는 구체가 떠 있습니다. 이것이... 세계의 근원.", icon: "\u{1F30C}", floorRange: [50, 50],
    choices: [
      { text: "손을 뻗는다", requirements: { worldKnowledge: 70 }, outcomes: { description: "모든 것이 이해됩니다. 창조와 파괴, 빛과 어둠... 세계는 균형 위에 존재합니다. 천상의 드레스를 얻었습니다!", worldKnowledgeChange: 30, statChanges: { magic: 5, faith: 5 }, outfitReward: "celestial", endDungeon: true } },
      { text: "기도를 올린다", requirements: { faith: 70 }, outcomes: { description: "여신과 마왕의 목소리가 동시에 들립니다. '균형을 지켜다오...' 신성한 사명을 받았어요.", worldKnowledgeChange: 25, statChanges: { faith: 8, morality: 5 }, endDungeon: true } },
      { text: "관찰만 한다", outcomes: { description: "이해하기엔 아직 이릅니다. 하지만 언젠간... 다음에 다시 와야겠어요.", worldKnowledgeChange: 10, endDungeon: true } },
    ],
  },
]

// 30 Endings with difficulty stars
export const ENDINGS: Ending[] = [
  // Secret/Legendary (5 stars)
  { id: "world-guardian", title: "세계의 수호자", description: "빛과 어둠의 균형을 이해하고, 세계의 진정한 수호자가 되었습니다. 여신과 마왕 모두가 당신을 인정합니다. 이 세계는 당신이 지키겠지요.", requirements: { worldKnowledge: 90, stats: { magic: 80, faith: 80 }, dungeonFloor: 50 }, priority: 1, image: "\u{1F31F}", difficulty: 5, category: "legend" },
  { id: "true-goddess", title: "새로운 여신", description: "세계의 핵심에 닿아 빛 그 자체가 되었습니다. 인간을 넘어선 존재로서 영원히 세계를 비추게 됩니다.", requirements: { worldKnowledge: 95, stats: { faith: 90, magic: 85, morality: 90 }, dungeonFloor: 50 }, priority: 0, image: "\u{1F4AB}", difficulty: 5, category: "secret" },
  { id: "demon-queen", title: "마왕의 후계자", description: "어둠의 힘을 받아들여 새로운 마왕이 되었습니다. 두려움의 대상이지만, 세계의 균형을 위해 필요한 존재입니다.", requirements: { worldKnowledge: 80, stats: { combat: 85, magic: 80 }, dungeonFloor: 40 }, priority: 2, image: "\u{1F608}", difficulty: 5, category: "dark" },

  // Noble (4 stars)
  { id: "queen", title: "여왕", description: "뛰어난 지성과 매력으로 왕국의 여왕이 되었습니다. 현명하고 자비로운 통치로 백성들에게 사랑받습니다.", requirements: { stats: { intelligence: 80, charm: 80, morality: 60 }, minGold: 1000 }, priority: 3, image: "\u{1F451}", difficulty: 4, category: "noble" },
  { id: "archmage", title: "대마법사", description: "마법의 극의에 도달하여 대마법사가 되었습니다. 마법 학원의 수장으로서 후학을 양성합니다.", requirements: { stats: { magic: 90, intelligence: 70 } }, priority: 4, image: "\u{1F52E}", difficulty: 4, category: "magic" },
  { id: "holy-knight-ending", title: "성기사", description: "신의 뜻을 받들어 성기사가 되었습니다. 빛의 검으로 악을 물리치고 약자를 보호합니다.", requirements: { stats: { combat: 80, faith: 70, morality: 70 } }, priority: 5, image: "\u2694\uFE0F", difficulty: 4, category: "combat" },
  { id: "saint", title: "성녀", description: "깊은 신앙심과 세계에 대한 이해로 성녀가 되었습니다. 기적을 행하며 사람들을 구원합니다.", requirements: { stats: { faith: 85, morality: 80 }, worldKnowledge: 60 }, priority: 6, image: "\u271D\uFE0F", difficulty: 4, category: "faith" },

  // Advanced (3 stars)
  { id: "sage", title: "세계의 현자", description: "세계의 비밀을 탐구하여 현자가 되었습니다. 진실을 추구하는 자들의 등불이 됩니다.", requirements: { stats: { intelligence: 80 }, worldKnowledge: 70 }, priority: 7, image: "\u{1F4DA}", difficulty: 3, category: "magic" },
  { id: "dark-knight-ending", title: "암흑 기사", description: "마왕의 힘을 받아 암흑 기사가 되었습니다. 어둠의 힘으로 세상의 질서에 도전합니다.", requirements: { stats: { combat: 75, magic: 60 }, dungeonFloor: 30 }, priority: 8, image: "\u{1F5A4}", difficulty: 3, category: "dark" },
  { id: "court-mage", title: "궁정 마법사", description: "왕실에서 인정받는 궁정 마법사가 되었습니다. 왕국의 수호를 위해 마법을 사용합니다.", requirements: { stats: { magic: 70, intelligence: 60, charm: 50 } }, priority: 9, image: "\u{1F9D9}\u200D\u2640\uFE0F", difficulty: 3, category: "magic" },
  { id: "dragon-slayer", title: "용사", description: "전설의 드래곤을 쓰러뜨리고 용사로 칭송받게 되었습니다. 영웅으로서의 길을 걸어갑니다.", requirements: { stats: { combat: 80, strength: 70 }, dungeonFloor: 40 }, priority: 10, image: "\u{1F409}", difficulty: 3, category: "combat" },
  { id: "famous-artist", title: "전설의 예술가", description: "탁월한 예술적 재능으로 대륙에서 가장 유명한 예술가가 되었습니다.", requirements: { stats: { creativity: 85, charm: 60 } }, priority: 11, image: "\u{1F3A8}", difficulty: 3, category: "art" },
  { id: "merchant-prince", title: "대상인", description: "뛰어난 상업 수완으로 대륙 최고의 상인이 되었습니다.", requirements: { stats: { charm: 60, intelligence: 50 }, minGold: 2000 }, priority: 12, image: "\u{1F4B0}", difficulty: 3, category: "noble" },
  { id: "sword-saint", title: "검성", description: "검의 도를 깨우친 검성이 되었습니다. 한 번의 검기로 산을 가릅니다.", requirements: { stats: { combat: 90, strength: 75 } }, priority: 13, image: "\u{1FA78}", difficulty: 3, category: "combat" },

  // Moderate (2 stars)
  { id: "royal-chef", title: "왕실 요리장", description: "최고의 요리 실력으로 왕실 요리장이 되었습니다.", requirements: { stats: { cooking: 85, creativity: 50 } }, priority: 14, image: "\u{1F468}\u200D\u{1F373}", difficulty: 2, category: "art" },
  { id: "high-priest", title: "대신관", description: "깊은 신앙심으로 대신관이 되었습니다.", requirements: { stats: { faith: 80, morality: 70 } }, priority: 15, image: "\u26EA", difficulty: 2, category: "faith" },
  { id: "adventurer", title: "전설의 모험가", description: "수많은 모험을 통해 전설적인 모험가가 되었습니다.", requirements: { stats: { combat: 65, strength: 60 }, dungeonFloor: 20 }, priority: 16, image: "\u{1F5FA}\uFE0F", difficulty: 2, category: "combat" },
  { id: "scholar-ending", title: "대학자", description: "학문에 매진하여 대학의 교수가 되었습니다. 많은 제자들이 당신을 따릅니다.", requirements: { stats: { intelligence: 75, creativity: 40 } }, priority: 17, image: "\u{1F393}", difficulty: 2, category: "art" },
  { id: "dancer", title: "왕실 무희", description: "아름다운 춤으로 왕실의 무희가 되었습니다. 모든 이를 매료시킵니다.", requirements: { stats: { charm: 75, creativity: 60 } }, priority: 18, image: "\u{1F483}", difficulty: 2, category: "art" },
  { id: "witch-ending", title: "숲의 마녀", description: "깊은 숲에서 마법을 연구하는 마녀가 되었습니다. 마을 사람들이 비밀리에 도움을 구해옵니다.", requirements: { stats: { magic: 70, cooking: 40 } }, priority: 19, image: "\u{1F9D9}\u200D\u2640\uFE0F", difficulty: 2, category: "magic" },
  { id: "knight-captain", title: "기사단장", description: "뛰어난 무예와 리더십으로 기사단을 이끌게 되었습니다.", requirements: { stats: { combat: 70, charm: 50, morality: 50 } }, priority: 20, image: "\u{1F6E1}\uFE0F", difficulty: 2, category: "combat" },

  // Easy (1 star)
  { id: "good-wife", title: "현모양처", description: "따뜻한 가정을 이루고 행복하게 살았습니다.", requirements: { stats: { housework: 70, cooking: 60, charm: 50 } }, priority: 21, image: "\u{1F3E0}", difficulty: 1, category: "life" },
  { id: "baker", title: "마을 빵집 주인", description: "맛있는 빵으로 유명한 빵집을 열었습니다. 소박하지만 행복한 삶입니다.", requirements: { stats: { cooking: 60, charm: 40 } }, priority: 22, image: "\u{1F35E}", difficulty: 1, category: "life" },
  { id: "farmer", title: "농부", description: "드넓은 농장을 일구며 자연과 함께 살아갑니다.", requirements: { stats: { strength: 50, housework: 50 } }, priority: 23, image: "\u{1F33E}", difficulty: 1, category: "life" },
  { id: "nun", title: "수녀", description: "신앙에 헌신하며 조용한 수도원에서 평화로운 삶을 살아갑니다.", requirements: { stats: { faith: 60, morality: 60 } }, priority: 24, image: "\u{1F64F}", difficulty: 1, category: "faith" },
  { id: "bard", title: "음유시인", description: "노래와 이야기로 세상을 떠도는 음유시인이 되었습니다.", requirements: { stats: { charm: 50, creativity: 50 } }, priority: 25, image: "\u{1F3B6}", difficulty: 1, category: "art" },
  { id: "mercenary", title: "용병", description: "검 하나를 들고 전장을 누비는 용병이 되었습니다.", requirements: { stats: { combat: 50, strength: 45 } }, priority: 26, image: "\u2694\uFE0F", difficulty: 1, category: "combat" },
  { id: "maid", title: "메이드", description: "귀족 가문에서 일하는 메이드가 되었습니다. 성실하고 꼼꼼한 성격으로 인정받습니다.", requirements: { stats: { housework: 55, morality: 40 } }, priority: 27, image: "\u{1F9F9}", difficulty: 1, category: "life" },
  { id: "commoner", title: "평범한 시민", description: "평범하지만 행복한 삶을 살았습니다. 소박하지만 충만한 일상입니다.", requirements: {}, priority: 100, image: "\u{1F33B}", difficulty: 1, category: "life" },
]

// Dialogue
export function getDialogueText(
  character: Character,
  topic: "greeting" | "mood" | "dream" | "world" | "love"
): string {
  const { age, personality, stats, worldKnowledge } = character
  const style = personality?.dialogueStyle || "gentle"
  const isYoung = age <= 12
  const isTeen = age >= 13 && age <= 15

  const dialogues: Record<string, Record<string, string[]>> = {
    greeting: {
      brave: isYoung ? ["아빠! 오늘 모험 가요!", "저 강해졌어요! 보세요!"] : isTeen ? ["아버지, 오늘은 무슨 훈련 할까요?", "전 두렵지 않아요!"] : ["아버지, 새로운 도전이 기다리고 있어요.", "오늘도 전진합니다."],
      gentle: isYoung ? ["아빠... 좋은 아침이에요.", "오늘 하늘이 예뻐요."] : isTeen ? ["아버지, 잘 주무셨어요?", "오늘도 평화로운 하루가 되면 좋겠어요."] : ["아버지, 안녕하세요.", "오늘 하루도 모두에게 좋은 일만 있길 바라요."],
      curious: isYoung ? ["아빠! 이거 봐요! 신기해!", "왜 하늘은 파란색이에요?"] : isTeen ? ["아버지, 이 책 정말 흥미로워요!", "세상엔 아직 모르는 게 너무 많아요."] : ["아버지, 새로운 발견을 했어요.", "지식이란 끝이 없는 것 같아요."],
      mischievous: isYoung ? ["아빠~ 히히, 장난쳐도 돼요?", "재미있는 거 하고 싶어요!"] : isTeen ? ["아버지! 오늘 재미있는 일 없을까요?", "좀 심심한데요~"] : ["아버지, 가끔은 규칙을 깨는 것도 재미있잖아요.", "삶은 즐거워야 해요."],
      dreamy: isYoung ? ["아빠... 어젯밤에 이상한 꿈 꿨어요...", "달님이 말을 걸었어요."] : isTeen ? ["아버지, 가끔 이 세계가 꿈 같아요.", "별들이 속삭이는 게 들려요."] : ["아버지, 현실과 꿈의 경계가 희미해지는 것 같아요.", "세계가 저를 부르는 것 같아요."],
    },
    mood: {
      brave: stats.stress > 50 ? ["조금 지쳤지만... 포기하지 않아요!"] : ["최고의 컨디션이에요!"],
      gentle: stats.stress > 50 ? ["조금 피곤해요... 쉬어도 될까요?"] : ["평온해요."],
      curious: stats.stress > 50 ? ["생각이 너무 많아서 머리가 복잡해요..."] : ["오늘도 배울 게 많아서 설레요!"],
      mischievous: stats.stress > 50 ? ["에이, 재미없어요..."] : ["오늘은 뭔가 재미있는 일이 생길 것 같아요!"],
      dreamy: stats.stress > 50 ? ["꿈과 현실이 뒤섞여요..."] : ["오늘 좋은 환상을 봤어요."],
    },
    dream: {
      brave: ["강한 기사가 되고 싶어요!", "세상의 모든 악을 물리치고 싶어요!"],
      gentle: ["모두가 행복한 세상을 만들고 싶어요.", "다친 사람들을 치료해주고 싶어요."],
      curious: ["세상의 모든 비밀을 알고 싶어요!", "위대한 학자가 되고 싶어요."],
      mischievous: ["세상에서 가장 재미있는 사람이 되고 싶어요!", "모두를 웃게 만들고 싶어요."],
      dreamy: ["꿈과 현실 사이를 오가고 싶어요.", "별들과 대화하고 싶어요."],
    },
    world: {
      brave: worldKnowledge < 30 ? ["세계? 정복할 대상이죠!"] : worldKnowledge < 60 ? ["세계엔 비밀이 있다고요? 찾아내겠어요!"] : ["빛과 어둠... 둘 다 필요한 거군요."],
      gentle: worldKnowledge < 30 ? ["이 세상은 아름다워요."] : worldKnowledge < 60 ? ["세계엔 슬픈 비밀이 숨어 있는 것 같아요."] : ["여신님과 마왕님... 둘 다 외로우셨을 거예요."],
      curious: worldKnowledge < 30 ? ["세계의 비밀을 파헤치고 말 거예요!"] : worldKnowledge < 60 ? ["점점 진실에 가까워지고 있어요!"] : ["드디어 이해했어요. 창조의 비밀을..."],
      mischievous: worldKnowledge < 30 ? ["세계? 그냥 재미있으면 되죠~"] : worldKnowledge < 60 ? ["비밀이 있다고요? 흥미롭네요!"] : ["여신이랑 마왕이 원래 하나였다니, 반전이네요!"],
      dreamy: worldKnowledge < 30 ? ["이 세계는 누군가의 꿈 같아요..."] : worldKnowledge < 60 ? ["꿈 속에서 진실을 봤어요..."] : ["이 세계는... 두 존재의 꿈이 만나는 곳이에요."],
    },
    love: {
      brave: isYoung ? ["사랑? 그게 뭐예요?"] : isTeen ? ["강한 사람을 존경해요!"] : ["함께 싸울 수 있는 동료... 그게 사랑인가요?"],
      gentle: isYoung ? ["아빠 사랑해요!"] : isTeen ? ["사랑하는 사람이 생기면... 어떤 기분일까요?"] : ["누군가를 진심으로 아끼는 마음... 소중해요."],
      curious: isYoung ? ["사랑이 뭐예요? 가르쳐주세요!"] : isTeen ? ["사랑도 연구 대상이에요!"] : ["사랑이란 감정... 정말 복잡하고 흥미로워요."],
      mischievous: isYoung ? ["사랑? 장난치는 거예요?"] : isTeen ? ["좋아하는 사람 놀리는 게 재미있어요~"] : ["사랑? 글쎄요, 재미있는 사람이 좋아요."],
      dreamy: isYoung ? ["사랑은... 꿈 같은 거예요?"] : isTeen ? ["운명적인 만남을 꿈꿔요..."] : ["사랑은 별들이 정해준 운명 같아요."],
    },
  }
  const topicDialogues = dialogues[topic][style] || dialogues[topic].gentle
  return topicDialogues[Math.floor(Math.random() * topicDialogues.length)]
}

// Utility
const MAX_DUNGEON_FLOOR = 50

function getRandomEnemy(floor: number): DungeonEnemy {
  const clampedFloor = Math.min(Math.max(floor, 1), MAX_DUNGEON_FLOOR)
  // Boss floors
  if ([10, 20, 30, 40, 50].includes(clampedFloor)) {
    const boss = DUNGEON_ENEMIES.find(e => e.isBoss && e.floorRange[0] === clampedFloor)
    if (boss) return boss
  }
  const available = DUNGEON_ENEMIES.filter(
    (e) => !e.isBoss && e.floorRange[0] <= clampedFloor && e.floorRange[1] >= clampedFloor
  )
  if (available.length === 0) return DUNGEON_ENEMIES[DUNGEON_ENEMIES.length - 1]
  return available[Math.floor(Math.random() * available.length)]
}

function getRandomEncounter(floor: number): DungeonEncounter | null {
  const clampedFloor = Math.min(Math.max(floor, 1), MAX_DUNGEON_FLOOR)
  const available = DUNGEON_ENCOUNTERS.filter(
    (e) => e.floorRange[0] <= clampedFloor && e.floorRange[1] >= clampedFloor
  )
  if (available.length === 0) return null
  return available[Math.floor(Math.random() * available.length)]
}

function getSeason(month: number): "spring" | "summer" | "fall" | "winter" {
  if (month >= 3 && month <= 5) return "spring"
  if (month >= 6 && month <= 8) return "summer"
  if (month >= 9 && month <= 11) return "fall"
  return "winter"
}

// localStorage helpers
const LS_UNLOCKED = 'princess_unlocked_endings'
const LS_SAVE_PREFIX = 'princess_save_'

function loadUnlockedFromStorage(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_UNLOCKED)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveUnlockedToStorage(ids: string[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(LS_UNLOCKED, JSON.stringify(ids)) } catch {}
}

// Store
export const useGameStore = create<GameState>((set, get) => ({
  screen: "title",
  character: { ...initialCharacter, stats: { ...initialStats } },
  gold: 100,
  year: 1,
  month: 1,
  week: 1,
  day: 1,
  weekSchedule: [null, null, null, null, null, null, null],
  weekResult: null,
  inventory: [],
  currentEvent: null,
  currentSeasonalEvent: null,
  currentEventResult: null,
  ending: null,
  gameStarted: false,
  eventLog: [],
  dungeon: { ...initialDungeon },
  seasonalEventsTriggered: [],
  unlockedEndings: loadUnlockedFromStorage(),

  setScreen: (screen) => set({ screen }),

  startCharacterCreation: (name, birthday) => {
    set({ character: { ...initialCharacter, name, birthday, stats: { ...initialStats } }, screen: "character-creation" })
  },

  setPersonality: (personality) => {
    const state = get()
    const newStats = { ...state.character.stats }
    for (const [stat, value] of Object.entries(personality.statBonuses)) {
      newStats[stat as keyof Stats] = Math.max(0, Math.min(200, (newStats[stat as keyof Stats] || 0) + (value || 0)))
    }
    set({ character: { ...state.character, personality, stats: newStats }, gameStarted: true, screen: "game" })
    get().addLog(`${state.character.name}의 모험이 시작됩니다!`)
  },

  startGame: (name) => {
    set({
      character: { ...initialCharacter, name, stats: { ...initialStats } },
      gold: 100, year: 1, month: 1, week: 1, day: 1,
      weekSchedule: [null, null, null, null, null, null, null], weekResult: null,
      inventory: [],
      currentEvent: null, currentSeasonalEvent: null, currentEventResult: null,
      ending: null, gameStarted: true, eventLog: [], dungeon: { ...initialDungeon },
      seasonalEventsTriggered: [], unlockedEndings: [], screen: "game",
    })
    get().addLog(`${name}의 모험이 시작됩니다!`)
  },

  resetGame: () => {
    const prevUnlocked = get().unlockedEndings
    set({
      screen: "title",
      character: { ...initialCharacter, stats: { ...initialStats } },
      gold: 100, year: 1, month: 1, week: 1, day: 1,
      weekSchedule: [null, null, null, null, null, null, null], weekResult: null,
      inventory: [],
      currentEvent: null, currentSeasonalEvent: null, currentEventResult: null,
      ending: null, gameStarted: false, eventLog: [], dungeon: { ...initialDungeon },
      seasonalEventsTriggered: [], unlockedEndings: prevUnlocked,
    })
  },

  addLog: (message) => {
    const state = get()
    set({ eventLog: [...state.eventLog.slice(-19), message] })
  },

  addOutfit: (outfitId) => {
    const state = get()
    if (!state.character.ownedOutfits.includes(outfitId)) {
      set({ character: { ...state.character, ownedOutfits: [...state.character.ownedOutfits, outfitId] } })
      const outfit = OUTFITS.find(o => o.id === outfitId)
      if (outfit) get().addLog(`새 옷을 획득했습니다: ${outfit.name}!`)
    }
  },

  changeOutfit: (outfitId) => {
    const state = get()
    if (state.character.ownedOutfits.includes(outfitId)) {
      set({ character: { ...state.character, currentOutfit: outfitId } })
    }
  },

  buyOutfit: (outfitId, price) => {
    const state = get()
    if (state.gold < price || state.character.ownedOutfits.includes(outfitId)) return false
    set({ gold: state.gold - price, character: { ...state.character, ownedOutfits: [...state.character.ownedOutfits, outfitId] } })
    const outfit = OUTFITS.find(o => o.id === outfitId)
    if (outfit) get().addLog(`${outfit.name}을(를) 구매했습니다!`)
    return true
  },

  setProfileImage: (url) => {
    set({ character: { ...get().character, profileImage: url } })
  },

  doActivity: (activity) => {
    const state = get()
    const newStats = { ...state.character.stats }

    if (activity.requirements) {
      for (const [stat, value] of Object.entries(activity.requirements)) {
        if ((newStats[stat as keyof Stats] || 0) < (value || 0)) { get().addLog(`${activity.name}에 필요한 능력치가 부족합니다.`); return }
      }
    }
    if (activity.goldChange < 0 && state.gold < Math.abs(activity.goldChange)) { get().addLog("골드가 부족합니다."); return }

    for (const [stat, value] of Object.entries(activity.statChanges)) {
      newStats[stat as keyof Stats] = Math.min(200, Math.max(0, (newStats[stat as keyof Stats] || 0) + (value || 0)))
    }

    const newStress = Math.min(state.character.maxStress, Math.max(0, state.character.stress + activity.stressChange))
    const newHealth = newStress >= state.character.maxStress ? state.character.health - 10 : state.character.health

    if (newHealth <= 0) {
      get().addLog("과로로 쓰러졌습니다! 강제 휴식합니다...")
      set({ character: { ...state.character, health: 30, stress: 0, stats: newStats }, gold: state.gold + activity.goldChange })
    } else {
      set({ character: { ...state.character, stats: newStats, stress: newStress, health: newHealth }, gold: state.gold + activity.goldChange })
    }

    get().addLog(`${activity.name} 완료! ${activity.goldChange > 0 ? `+${activity.goldChange}G` : activity.goldChange < 0 ? `${activity.goldChange}G` : ""}`)
    set({
      currentEventResult: {
        title: `${activity.name} 완료!`,
        description: activity.description,
        icon: activity.icon,
        statChanges: activity.statChanges,
        goldChange: activity.goldChange || undefined,
        stressChange: activity.stressChange || undefined,
      },
    })
    get().advanceTime()
  },

  goAdventure: () => {
    const state = get()
    if (state.gold < 20) { get().addLog("모험에 필요한 비용이 부족합니다. (20골드)"); return }
    set({ gold: state.gold - 20 })
    get().startDungeon()
  },

  resolveEvent: (choiceIndex) => {
    const state = get()
    if (!state.currentEvent) return
    const choice = state.currentEvent.choices[choiceIndex]
    if (choice.requirements) {
      for (const [stat, value] of Object.entries(choice.requirements)) {
        if ((state.character.stats[stat as keyof Stats] || 0) < (value || 0)) { get().addLog("능력치가 부족합니다."); return }
      }
    }
    const outcome = choice.outcomes
    const newStats = { ...state.character.stats }
    if (outcome.statChanges) {
      for (const [stat, value] of Object.entries(outcome.statChanges)) {
        newStats[stat as keyof Stats] = Math.min(200, Math.max(0, (newStats[stat as keyof Stats] || 0) + (value || 0)))
      }
    }
    const newHealth = Math.min(state.character.maxHealth, Math.max(0, state.character.health + (outcome.healthChange || 0)))
    const newStress = Math.min(state.character.maxStress, Math.max(0, state.character.stress + (outcome.stressChange || 0)))
    set({
      character: { ...state.character, stats: newStats, health: newHealth, stress: newStress },
      gold: state.gold + (outcome.goldChange || 0),
      currentEvent: null,
      currentEventResult: { title: state.currentEvent.title, description: outcome.description, icon: "\u{1F4DC}", statChanges: outcome.statChanges, goldChange: outcome.goldChange, healthChange: outcome.healthChange, stressChange: outcome.stressChange },
    })
    get().addLog(outcome.description)
    get().advanceTime()
  },

  resolveSeasonalEvent: (choiceIndex) => {
    const state = get()
    if (!state.currentSeasonalEvent) return
    const choice = state.currentSeasonalEvent.choices[choiceIndex]
    if (choice.requirements) {
      for (const [stat, value] of Object.entries(choice.requirements)) {
        if ((state.character.stats[stat as keyof Stats] || 0) < (value || 0)) { get().addLog("능력치가 부족합니다."); return }
      }
    }
    const outcome = choice.outcomes
    const newStats = { ...state.character.stats }
    if (outcome.statChanges) {
      for (const [stat, value] of Object.entries(outcome.statChanges)) {
        newStats[stat as keyof Stats] = Math.min(200, Math.max(0, (newStats[stat as keyof Stats] || 0) + (value || 0)))
      }
    }
    const newHealth = Math.min(state.character.maxHealth, Math.max(0, state.character.health + (outcome.healthChange || 0)))
    const newStress = Math.min(state.character.maxStress, Math.max(0, state.character.stress + (outcome.stressChange || 0)))
    const newWorldKnowledge = Math.min(100, Math.max(0, state.character.worldKnowledge + (outcome.worldKnowledgeChange || 0)))

    // 이미 보유한 옷이면 outfitReward 무시
    const newOutfit = outcome.outfitReward && !state.character.ownedOutfits.includes(outcome.outfitReward)
      ? outcome.outfitReward : undefined

    const seasonNames = { spring: "\uBD04", summer: "\uC5EC\uB984", fall: "\uAC00\uC744", winter: "\uACA8\uC6B8" }
    set({
      character: { ...state.character, stats: newStats, health: newHealth, stress: newStress, worldKnowledge: newWorldKnowledge },
      gold: state.gold + (outcome.goldChange || 0),
      currentSeasonalEvent: null,
      currentEventResult: {
        title: `${seasonNames[state.currentSeasonalEvent.season]} - ${state.currentSeasonalEvent.title}`,
        description: outcome.description,
        icon: state.currentSeasonalEvent.season === "spring" ? "\u{1F338}" : state.currentSeasonalEvent.season === "summer" ? "\u2600\uFE0F" : state.currentSeasonalEvent.season === "fall" ? "\u{1F342}" : "\u2744\uFE0F",
        statChanges: outcome.statChanges, goldChange: outcome.goldChange, healthChange: outcome.healthChange,
        stressChange: outcome.stressChange, worldKnowledgeChange: outcome.worldKnowledgeChange,
        outfitReward: newOutfit,
      },
      screen: "game",
    })
    get().addLog(`[${seasonNames[state.currentSeasonalEvent.season]}] ${outcome.description}`)
  },

  clearEventResult: () => {
    const state = get()
    const rewardId = state.currentEventResult?.outfitReward
    if (rewardId && !state.character.ownedOutfits.includes(rewardId)) {
      get().addOutfit(rewardId)
    }
    set({ currentEventResult: null })
  },

  setWeekSchedule: (schedule) => set({ weekSchedule: schedule }),

  saveGame: (slotName: string) => {
    if (typeof window === 'undefined') return
    const state = get()
    const key = LS_SAVE_PREFIX + Date.now()
    const saveData = {
      key,
      name: slotName,
      characterName: state.character.name,
      age: state.character.age,
      year: state.year,
      month: state.month,
      savedAt: new Date().toLocaleString('ko-KR'),
      // 게임 상태 전체 저장 (함수 제외)
      state: {
        character: state.character,
        gold: state.gold,
        year: state.year,
        month: state.month,
        week: state.week,
        day: state.day,
        inventory: state.inventory,
        eventLog: state.eventLog,
        dungeon: state.dungeon,
        seasonalEventsTriggered: state.seasonalEventsTriggered,
        unlockedEndings: state.unlockedEndings,
        gameStarted: state.gameStarted,
      }
    }
    try {
      localStorage.setItem(key, JSON.stringify(saveData))
      get().addLog(`💾 저장 완료: ${slotName}`)
    } catch {}
  },

  loadGame: (slotKey: string) => {
    if (typeof window === 'undefined') return false
    try {
      const raw = localStorage.getItem(slotKey)
      if (!raw) return false
      const saveData = JSON.parse(raw)
      const s = saveData.state
      // unlockedEndings는 현재 것과 합산 (더 많은 쪽)
      const mergedUnlocked = Array.from(new Set([...get().unlockedEndings, ...(s.unlockedEndings || [])]))
      saveUnlockedToStorage(mergedUnlocked)
      set({
        screen: 'game',
        character: s.character,
        gold: s.gold,
        year: s.year,
        month: s.month,
        week: s.week,
        day: s.day || 1,
        inventory: s.inventory || [],
        eventLog: s.eventLog || [],
        dungeon: s.dungeon || { ...initialDungeon },
        seasonalEventsTriggered: s.seasonalEventsTriggered || [],
        unlockedEndings: mergedUnlocked,
        gameStarted: true,
        weekSchedule: [null, null, null, null, null, null, null],
        weekResult: null,
        currentEvent: null,
        currentSeasonalEvent: null,
        currentEventResult: null,
        ending: null,
      })
      return true
    } catch { return false }
  },

  getSaveSlots: () => {
    if (typeof window === 'undefined') return []
    const slots: SaveSlot[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(LS_SAVE_PREFIX)) continue
      try {
        const raw = localStorage.getItem(key)
        if (!raw) continue
        const data = JSON.parse(raw)
        slots.push({
          key: data.key,
          name: data.name,
          characterName: data.characterName,
          age: data.age,
          year: data.year,
          month: data.month,
          savedAt: data.savedAt,
        })
      } catch {}
    }
    return slots.sort((a, b) => b.key.localeCompare(a.key))
  },

  deleteSave: (slotKey: string) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(slotKey)
  },

  clearWeekResult: () => set({ weekResult: null }),

  executeWeek: () => {
    const state = get()
    const { weekSchedule, character, gold } = state

    const results: DayResult[] = []
    let currentStats = { ...character.stats }
    let currentGold = gold
    let currentHealth = character.health
    let currentStress = character.stress

    // 이번 주 첫째 날 (day 계산: week는 1~4, 각 주 7일)
    const weekStartDay = (state.week - 1) * 7 + 1
    const birthdayDay = character.birthday.day
    const birthdayMonth = character.birthday.month
    const isBirthdayMonth = state.month === birthdayMonth

    // 계절 이벤트 날짜 (월 중반 14일)
    const seasonalEventDays = [14]

    for (let i = 0; i < 7; i++) {
      const currentDay = weekStartDay + i
      const activityId = weekSchedule[i]

      // 생일 체크
      if (isBirthdayMonth && currentDay === birthdayDay) {
        const isFirstBirthday = !character.ownedOutfits.includes('birthday-dress')
        results.push({
          day: currentDay,
          activityId: null,
          activityName: '생일',
          activityIcon: '🎂',
          result: 'birthday',
          resultLabel: '🎉 생일 축하해!',
          goldChange: 50,
          stressChange: -20,
          eventTitle: `${character.name}의 생일!`,
        })
        currentGold += 50
        currentStress = Math.max(0, currentStress - 20)
        continue
      }

      // 빈 칸
      if (!activityId) {
        results.push({
          day: currentDay,
          activityId: null,
          activityName: '자유 시간',
          activityIcon: '🌸',
          result: 'empty',
          resultLabel: '쉬었어요',
          stressChange: -5,
        })
        currentStress = Math.max(0, currentStress - 5)
        continue
      }

      // 던전 탐험: 슬롯 전체를 채우고 던전 화면으로 이동
      if (activityId === 'dungeon-explore') {
        results.push({
          day: currentDay,
          activityId: 'dungeon-explore',
          activityName: '던전 탐험',
          activityIcon: '🏰',
          result: 'event',
          resultLabel: '🏰 출발!',
          goldChange: -20,
          stressChange: 15,
        })
        // 나머지 날은 던전으로 채움
        for (let j = i + 1; j < 7; j++) {
          results.push({
            day: weekStartDay + j,
            activityId: 'dungeon-explore',
            activityName: '던전 탐험 중',
            activityIcon: '⚔️',
            result: 'event',
            resultLabel: '⚔️ 탐험 중...',
          })
        }
        currentGold = Math.max(0, currentGold - 20)
        currentStress = Math.min(100, currentStress + 15)
        break  // 나머지 루프 중단
      }

      const activity = ACTIVITIES.find(a => a.id === activityId)
      if (!activity) continue

      // 스탯 기반 성공 확률 계산
      // 관련 스탯의 평균으로 대성공/실패 결정
      const relevantStats = Object.keys(activity.statChanges)
      const avgStat = relevantStats.length > 0
        ? relevantStats.reduce((sum, s) => sum + (currentStats[s as keyof Stats] || 0), 0) / relevantStats.length
        : 50
      
      const stressModifier = currentStress > 80 ? -20 : currentStress > 50 ? -10 : 0
      const effectiveStat = Math.max(0, avgStat + stressModifier)

      // 확률: 스탯 200 기준
      // 대성공: effectiveStat/200 * 0.4 (최대 40%)
      // 실패: (200 - effectiveStat)/200 * 0.2 (최소 0%, 최대 20%)
      // 나머지: 성공
      const greatChance = (effectiveStat / 200) * 0.4
      const failChance = ((200 - effectiveStat) / 200) * 0.2
      const roll = Math.random()

      let result: DayResult['result']
      let resultLabel: string
      let multiplier = 1

      if (roll < failChance) {
        result = 'fail'
        resultLabel = '😔 실패...'
        multiplier = 0
      } else if (roll < failChance + greatChance) {
        result = 'great'
        resultLabel = '✨ 대성공!'
        multiplier = 2
      } else {
        result = 'success'
        resultLabel = '✅ 성공'
        multiplier = 1
      }

      // 스탯 적용
      const statChanges: Partial<Stats> = {}
      if (result !== 'fail') {
        for (const [stat, val] of Object.entries(activity.statChanges)) {
          const change = Math.round((val || 0) * multiplier)
          statChanges[stat as keyof Stats] = change
          currentStats[stat as keyof Stats] = Math.min(200, Math.max(0, (currentStats[stat as keyof Stats] || 0) + change))
        }
      }

      const goldChange = activity.goldChange !== 0 ? Math.round(activity.goldChange * (result === 'fail' ? 0.5 : multiplier === 2 ? 1.5 : 1)) : 0
      const stressChange = result === 'great' ? Math.round(activity.stressChange * 0.5) : result === 'fail' ? activity.stressChange + 5 : activity.stressChange

      currentGold = Math.max(0, currentGold + goldChange)
      currentStress = Math.min(100, Math.max(0, currentStress + stressChange))
      currentHealth = result === 'fail' ? Math.max(1, currentHealth - 2) : currentHealth

      results.push({
        day: currentDay,
        activityId,
        activityName: activity.name,
        activityIcon: activity.icon,
        result,
        resultLabel,
        statChanges: Object.keys(statChanges).length > 0 ? statChanges : undefined,
        goldChange: goldChange !== 0 ? goldChange : undefined,
        stressChange: stressChange !== 0 ? stressChange : undefined,
      })
    }

    // 결과 반영
    set({
      character: {
        ...character,
        stats: currentStats,
        health: currentHealth,
        stress: currentStress,
      },
      gold: currentGold,
      weekResult: results,
      weekSchedule: [null, null, null, null, null, null, null],
    })

    // 던전 탐험 처리: 결과 저장 후 던전으로 이동
    const hasDungeon = results.some(r => r.activityId === 'dungeon-explore')
    if (hasDungeon) {
      set({
        character: { ...character, stats: currentStats, health: currentHealth, stress: currentStress },
        gold: currentGold,
        weekResult: results,
        weekSchedule: [null, null, null, null, null, null, null],
      })
      // 잠시 후 던전 진입
      setTimeout(() => get().startDungeon(), 1500)
      return
    }

    // 생일 이벤트 결과 처리
    const birthdayResult = results.find(r => r.result === 'birthday')
    if (birthdayResult) {
      const isFirstBirthday = !character.ownedOutfits.includes('birthday-dress')
      set({
        currentEventResult: {
          title: `🎂 ${character.name}의 생일!`,
          description: `마을 사람들이 모여 ${character.name}의 생일을 축하해주었습니다! 기분이 좋아졌어요.${isFirstBirthday ? ' 특별한 생일 드레스를 선물받았습니다!' : ''}`,
          icon: '🎂',
          goldChange: 50,
          stressChange: -20,
          outfitReward: isFirstBirthday ? 'birthday-dress' : undefined,
        }
      })
    }

    // 주 진행 (advanceTime 대신 직접)
    get().advanceTime()
  },

  buyItem: (item) => {
    const state = get()
    if (state.gold < item.price) return false
    const existingItem = state.inventory.find((i) => i.id === item.id)
    if (existingItem) {
      set({ gold: state.gold - item.price, inventory: state.inventory.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) })
    } else {
      set({ gold: state.gold - item.price, inventory: [...state.inventory, { ...item, quantity: 1 }] })
    }
    get().addLog(`${item.name}을(를) 구매했습니다!`)
    return true
  },

  useItem: (itemId) => {
    const state = get()
    const item = state.inventory.find((i) => i.id === itemId)
    if (!item || item.quantity <= 0) return false
    const newStats = { ...state.character.stats }
    let newHealth = state.character.health
    let newStress = state.character.stress
    for (const [key, value] of Object.entries(item.effect)) {
      if (key === "health") newHealth = Math.min(state.character.maxHealth, newHealth + (value || 0))
      else if (key === "stress") newStress = Math.max(0, newStress + (value || 0))
      else newStats[key as keyof Stats] = Math.min(200, Math.max(0, (newStats[key as keyof Stats] || 0) + (value || 0)))
    }
    set({
      character: { ...state.character, stats: newStats, health: newHealth, stress: newStress },
      inventory: item.quantity === 1 ? state.inventory.filter((i) => i.id !== itemId) : state.inventory.map((i) => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i),
    })
    get().addLog(`${item.name}을(를) 사용했습니다!`)
    return true
  },

  advanceTime: () => {
    const state = get()
    let { year, month, week } = state
    const newDay = (week - 1) * 7 + 1  // 다음 주 첫날
    week++
    if (week > 4) {
      week = 1
      month++

      // Check seasonal event
      if (month === 3 || month === 6 || month === 9 || month === 12) {
        const season = getSeason(month)
        const availableEvents = SEASONAL_EVENTS.filter(e => e.season === season && !state.seasonalEventsTriggered.includes(`${year}-${e.id}`))
        if (availableEvents.length > 0) {
          const event = availableEvents[Math.floor(Math.random() * availableEvents.length)]
          set({ currentSeasonalEvent: event, seasonalEventsTriggered: [...state.seasonalEventsTriggered, `${year}-${event.id}`], screen: "seasonal" })
        }
      }

      // Check birthday: 생일 날짜(day)로 주차 계산 (1~7일=1주, 8~14일=2주, 15~21일=3주, 22~=4주)
      const birthdayWeek = Math.ceil(state.character.birthday.day / 7)
      if (month === state.character.birthday.month && week === birthdayWeek) {
        const isFirstBirthday = !state.character.ownedOutfits.includes("birthday-dress")
        get().addLog(`\u{1F382} ${state.character.name}의 생일입니다! 모두가 축하해줍니다!`)
        set({
          character: { ...get().character, stress: Math.max(0, get().character.stress - 20) },
          gold: get().gold + 50,
          currentEventResult: {
            title: `\u{1F382} ${state.character.name}의 생일!`,
            description: `마을 사람들이 모여 ${state.character.name}의 생일을 축하해주었습니다! 선물과 축하를 받아 기분이 좋아졌어요.${isFirstBirthday ? " 특별한 생일 드레스를 선물받았습니다!" : ""}`,
            icon: "\u{1F382}",
            goldChange: 50,
            stressChange: -20,
            outfitReward: isFirstBirthday ? "birthday-dress" : undefined,
          },
        })
      }

      if (month > 12) {
        month = 1
        year++
        set({ character: { ...get().character, age: get().character.age + 1 } })
        get().addLog(`새해가 밝았습니다! ${get().character.name}은(는) 이제 ${get().character.age}살입니다.`)
        if (get().character.worldKnowledge >= 80 && !get().character.ownedOutfits.includes("celestial")) {
          get().addOutfit("celestial")
        }
      }
    }

    set({ year, month, week, day: (week - 1) * 7 + 1 })

    // Check for game end: age 14 (4 years from age 10)
    if (get().character.age >= 14) {
      const ending = get().checkEnding()
      if (ending) {
        const prev = get().unlockedEndings
        const newUnlocked = prev.includes(ending.id) ? prev : [...prev, ending.id]
        saveUnlockedToStorage(newUnlocked)
        set({ ending, unlockedEndings: newUnlocked, screen: "ending" })
      }
    }
  },

  checkEnding: () => {
    const state = get()
    const { stats, worldKnowledge } = state.character
    const sortedEndings = [...ENDINGS].sort((a, b) => a.priority - b.priority)

    for (const ending of sortedEndings) {
      let qualifies = true
      if (ending.requirements.stats) {
        for (const [stat, value] of Object.entries(ending.requirements.stats)) {
          if ((stats[stat as keyof Stats] || 0) < (value || 0)) { qualifies = false; break }
        }
      }
      if (ending.requirements.minGold && state.gold < ending.requirements.minGold) qualifies = false
      if (ending.requirements.worldKnowledge && worldKnowledge < ending.requirements.worldKnowledge) qualifies = false
      if (ending.requirements.dungeonFloor && state.dungeon.maxFloorReached < ending.requirements.dungeonFloor) qualifies = false
      if (qualifies) return ending
    }
    return ENDINGS[ENDINGS.length - 1]
  },

  getQualifiedEndings: () => {
    const state = get()
    const { stats, worldKnowledge } = state.character
    return ENDINGS.filter(ending => {
      if (ending.id === 'commoner') return false  // 기본 엔딩은 제외
      let qualifies = true
      if (ending.requirements.stats) {
        for (const [stat, value] of Object.entries(ending.requirements.stats)) {
          if ((stats[stat as keyof Stats] || 0) < (value || 0)) { qualifies = false; break }
        }
      }
      if (ending.requirements.minGold && state.gold < ending.requirements.minGold) qualifies = false
      if (ending.requirements.worldKnowledge && worldKnowledge < ending.requirements.worldKnowledge) qualifies = false
      if (ending.requirements.dungeonFloor && state.dungeon.maxFloorReached < ending.requirements.dungeonFloor) qualifies = false
      return qualifies
    }).sort((a, b) => a.priority - b.priority)
  },

  viewEnding: (endingId: string) => {
    const ending = ENDINGS.find(e => e.id === endingId)
    if (!ending) return
    const prev = get().unlockedEndings
    const newUnlocked = prev.includes(endingId) ? prev : [...prev, endingId]
    saveUnlockedToStorage(newUnlocked)
    set({ ending, unlockedEndings: newUnlocked, screen: 'ending' })
  },

  // Dungeon system
  startDungeon: () => {
    const state = get()
    const maxHP = Math.floor(50 + state.character.stats.strength * 1.5 + state.character.stats.combat)
    set({
      dungeon: {
        active: true, floor: 1,
        maxFloorReached: Math.max(1, state.dungeon.maxFloorReached),
        currentHP: maxHP, maxHP,
        currentEncounter: null, currentEnemy: null, enemyHP: 0,
        combatLog: ["던전에 입장했습니다..."],
        loot: { gold: 0, statGains: {} },
      },
      screen: "dungeon",
    })
    get().addLog("던전에 입장했습니다!")
    get().proceedDungeon()
  },

  proceedDungeon: () => {
    const state = get()
    const { dungeon } = state
    if (dungeon.floor > MAX_DUNGEON_FLOOR) { get().endDungeon(true); return }

    // Boss floors always have a boss enemy
    if ([10, 20, 30, 40, 50].includes(dungeon.floor)) {
      const boss = DUNGEON_ENEMIES.find(e => e.isBoss && e.floorRange[0] === dungeon.floor)
      if (boss) {
        const scaledHP = Math.floor(boss.hp * (1 + dungeon.floor * 0.05))
        set({
          dungeon: {
            ...dungeon, currentEnemy: boss, enemyHP: scaledHP, currentEncounter: null,
            combatLog: [...dungeon.combatLog, `--- ${dungeon.floor}층 BOSS ---`, `${boss.name}(이)가 나타났다!`],
          },
        })
        return
      }
    }

    const isEnemy = Math.random() < 0.6
    if (isEnemy) {
      const enemy = getRandomEnemy(dungeon.floor)
      const scaledHP = Math.floor(enemy.hp * (1 + dungeon.floor * 0.05))
      set({
        dungeon: {
          ...dungeon, currentEnemy: enemy, enemyHP: scaledHP, currentEncounter: null,
          combatLog: [...dungeon.combatLog, `${dungeon.floor}층에서 ${enemy.name}(이)가 나타났다!`],
        },
      })
    } else {
      const encounter = getRandomEncounter(dungeon.floor)
      if (encounter) {
        set({
          dungeon: {
            ...dungeon, currentEncounter: encounter, currentEnemy: null,
            combatLog: [...dungeon.combatLog, `${dungeon.floor}층: ${encounter.title}`],
          },
        })
      } else {
        const enemy = getRandomEnemy(dungeon.floor)
        const scaledHP = Math.floor(enemy.hp * (1 + dungeon.floor * 0.05))
        set({
          dungeon: {
            ...dungeon, currentEnemy: enemy, enemyHP: scaledHP, currentEncounter: null,
            combatLog: [...dungeon.combatLog, `${dungeon.floor}층에서 ${enemy.name}(이)가 나타났다!`],
          },
        })
      }
    }
  },

  attackEnemy: () => {
    const state = get()
    const { dungeon, character } = state
    if (!dungeon.currentEnemy) return
    const enemy = dungeon.currentEnemy
    const playerAttack = Math.floor(10 + character.stats.combat * 0.8 + character.stats.strength * 0.4 + Math.random() * 10)
    const playerDamage = Math.max(1, playerAttack - enemy.defense)
    const newEnemyHP = dungeon.enemyHP - playerDamage
    const newLog = [...dungeon.combatLog, `${enemy.name}에게 ${playerDamage} 데미지!`]

    if (newEnemyHP <= 0) {
      const newLoot = { gold: dungeon.loot.gold + enemy.goldReward, statGains: { ...dungeon.loot.statGains } }
      for (const [stat, value] of Object.entries(enemy.expReward)) {
        newLoot.statGains[stat as keyof Stats] = (newLoot.statGains[stat as keyof Stats] || 0) + (value || 0)
      }
      // Award dragon armor for boss-dragon
      if (enemy.id === "boss-dragon" && !character.ownedOutfits.includes("dragon-armor")) {
        get().addOutfit("dragon-armor")
      }
      // Award void robe for reaching floor 50
      if (enemy.id === "boss-sealed-god" && !character.ownedOutfits.includes("void-robe")) {
        get().addOutfit("void-robe")
      }
      const newFloor = dungeon.floor + 1
      set({
        dungeon: {
          ...dungeon, floor: newFloor, maxFloorReached: Math.max(newFloor, dungeon.maxFloorReached),
          currentEnemy: null, enemyHP: 0, loot: newLoot,
          combatLog: [...newLog, `${enemy.name}을(를) 처치했다! (+${enemy.goldReward}G)`, newFloor > MAX_DUNGEON_FLOOR ? "던전을 완전히 정복했다!" : `${newFloor}층으로 진행...`],
        },
      })
      if (newFloor > MAX_DUNGEON_FLOOR) setTimeout(() => get().endDungeon(true), 500)
      else setTimeout(() => get().proceedDungeon(), 500)
    } else {
      const enemyAttack = Math.floor(enemy.attack * (0.8 + Math.random() * 0.4))
      const playerDefense = Math.floor(character.stats.strength * 0.3 + character.stats.combat * 0.2)
      const enemyDamage = Math.max(1, enemyAttack - playerDefense)
      const newPlayerHP = dungeon.currentHP - enemyDamage
      if (newPlayerHP <= 0) {
        set({ dungeon: { ...dungeon, currentHP: 0, enemyHP: newEnemyHP, combatLog: [...newLog, `${enemy.name}의 반격! ${enemyDamage} 데미지!`, "쓰러졌습니다..."] } })
        setTimeout(() => get().endDungeon(false), 1000)
      } else {
        set({ dungeon: { ...dungeon, currentHP: newPlayerHP, enemyHP: newEnemyHP, combatLog: [...newLog, `${enemy.name}의 반격! ${enemyDamage} 데미지!`] } })
      }
    }
  },

  useMagicAttack: () => {
    const state = get()
    const { dungeon, character } = state
    if (!dungeon.currentEnemy) return
    const enemy = dungeon.currentEnemy
    const magicPower = Math.floor(15 + character.stats.magic * 1.2 + character.stats.intelligence * 0.3 + Math.random() * 15)
    const magicDamage = Math.max(1, magicPower - enemy.magicResist)
    const newEnemyHP = dungeon.enemyHP - magicDamage
    const newLog = [...dungeon.combatLog, `마법 공격! ${enemy.name}에게 ${magicDamage} 데미지!`]

    if (newEnemyHP <= 0) {
      const newLoot = { gold: dungeon.loot.gold + enemy.goldReward, statGains: { ...dungeon.loot.statGains } }
      for (const [stat, value] of Object.entries(enemy.expReward)) {
        newLoot.statGains[stat as keyof Stats] = (newLoot.statGains[stat as keyof Stats] || 0) + (value || 0)
      }
      if (enemy.id === "boss-dragon" && !character.ownedOutfits.includes("dragon-armor")) get().addOutfit("dragon-armor")
      if (enemy.id === "boss-sealed-god" && !character.ownedOutfits.includes("void-robe")) get().addOutfit("void-robe")
      const newFloor = dungeon.floor + 1
      set({
        dungeon: {
          ...dungeon, floor: newFloor, maxFloorReached: Math.max(newFloor, dungeon.maxFloorReached),
          currentEnemy: null, enemyHP: 0, loot: newLoot,
          combatLog: [...newLog, `${enemy.name}을(를) 처치했다! (+${enemy.goldReward}G)`, newFloor > MAX_DUNGEON_FLOOR ? "던전을 완전히 정복했다!" : `${newFloor}층으로 진행...`],
        },
      })
      if (newFloor > MAX_DUNGEON_FLOOR) setTimeout(() => get().endDungeon(true), 500)
      else setTimeout(() => get().proceedDungeon(), 500)
    } else {
      const enemyAttack = Math.floor(enemy.attack * (0.6 + Math.random() * 0.3))
      const playerDefense = Math.floor(character.stats.magic * 0.2)
      const enemyDamage = Math.max(1, enemyAttack - playerDefense)
      const newPlayerHP = dungeon.currentHP - enemyDamage
      if (newPlayerHP <= 0) {
        set({ dungeon: { ...dungeon, currentHP: 0, enemyHP: newEnemyHP, combatLog: [...newLog, `${enemy.name}의 반격! ${enemyDamage} 데미지!`, "쓰러졌습니다..."] } })
        setTimeout(() => get().endDungeon(false), 1000)
      } else {
        set({ dungeon: { ...dungeon, currentHP: newPlayerHP, enemyHP: newEnemyHP, combatLog: [...newLog, `${enemy.name}의 반격! ${enemyDamage} 데미지!`] } })
      }
    }
  },

  fleeDungeon: () => {
    const state = get()
    const { dungeon } = state
    const escapeChance = Math.max(0.3, 0.7 - dungeon.floor * 0.01)
    if (Math.random() < escapeChance) {
      set({ dungeon: { ...dungeon, combatLog: [...dungeon.combatLog, "도망에 성공했습니다!"] } })
      setTimeout(() => get().endDungeon(true), 500)
    } else {
      const damage = Math.floor(10 + dungeon.floor * 2)
      const newHP = dungeon.currentHP - damage
      if (newHP <= 0) {
        set({ dungeon: { ...dungeon, currentHP: 0, combatLog: [...dungeon.combatLog, `도망에 실패! ${damage} 데미지를 받았습니다!`, "쓰러졌습니다..."] } })
        setTimeout(() => get().endDungeon(false), 1000)
      } else {
        set({ dungeon: { ...dungeon, currentHP: newHP, combatLog: [...dungeon.combatLog, `도망에 실패! ${damage} 데미지를 받았습니다!`] } })
      }
    }
  },

  resolveDungeonChoice: (choiceIndex) => {
    const state = get()
    const { dungeon, character } = state
    if (!dungeon.currentEncounter) return
    const choice = dungeon.currentEncounter.choices?.[choiceIndex]
    if (!choice) return

    if (choice.requirements) {
      for (const [key, value] of Object.entries(choice.requirements)) {
        if (key === "worldKnowledge") {
          if (character.worldKnowledge < (value || 0)) { set({ dungeon: { ...dungeon, combatLog: [...dungeon.combatLog, "세계에 대한 이해가 부족합니다..."] } }); return }
        } else if ((character.stats[key as keyof Stats] || 0) < (value || 0)) {
          set({ dungeon: { ...dungeon, combatLog: [...dungeon.combatLog, "능력치가 부족합니다..."] } }); return
        }
      }
    }

    const outcome = choice.outcomes
    const newStats = { ...character.stats }
    if (outcome.statChanges) {
      for (const [stat, value] of Object.entries(outcome.statChanges)) {
        newStats[stat as keyof Stats] = Math.min(200, Math.max(0, (newStats[stat as keyof Stats] || 0) + (value || 0)))
      }
    }
    const newHP = Math.min(dungeon.maxHP, Math.max(0, dungeon.currentHP + (outcome.healthChange || 0)))
    const newWorldKnowledge = Math.min(100, Math.max(0, character.worldKnowledge + (outcome.worldKnowledgeChange || 0)))
    const newGold = Math.max(0, state.gold + (outcome.goldChange || 0))
    // outfitReward는 clearEventResult에서 addOutfit 호출 (중복 방지)

    set({
      character: { ...character, stats: newStats, worldKnowledge: newWorldKnowledge },
      gold: newGold,
      dungeon: {
        ...dungeon, currentHP: newHP, currentEncounter: null,
        loot: { gold: dungeon.loot.gold + Math.max(0, outcome.goldChange || 0), statGains: outcome.statChanges ? { ...dungeon.loot.statGains, ...outcome.statChanges } : dungeon.loot.statGains },
        combatLog: [...dungeon.combatLog, outcome.description],
      },
      ...(outcome.outfitReward && !character.ownedOutfits.includes(outcome.outfitReward) ? {
        currentEventResult: {
          title: dungeon.currentEncounter?.title || "아이템 획득",
          description: outcome.description,
          icon: dungeon.currentEncounter?.icon || "🎁",
          statChanges: outcome.statChanges,
          goldChange: outcome.goldChange || undefined,
          healthChange: outcome.healthChange || undefined,
          worldKnowledgeChange: outcome.worldKnowledgeChange || undefined,
          outfitReward: outcome.outfitReward,
        }
      } : {}),
    })

    if (outcome.endDungeon) {
      setTimeout(() => get().endDungeon(true), 500)
    } else if (outcome.nextFloor) {
      const newFloor = dungeon.floor + 1
      set({
        dungeon: {
          ...get().dungeon, floor: newFloor, maxFloorReached: Math.max(newFloor, dungeon.maxFloorReached),
          combatLog: [...get().dungeon.combatLog, newFloor > MAX_DUNGEON_FLOOR ? "던전을 완전히 정복했다!" : `${newFloor}층으로 진행...`],
        },
      })
      if (newFloor > MAX_DUNGEON_FLOOR) setTimeout(() => get().endDungeon(true), 500)
      else setTimeout(() => get().proceedDungeon(), 500)
    }
  },

  endDungeon: (success) => {
    const state = get()
    const { dungeon, character } = state
    const newStats = { ...character.stats }
    for (const [stat, value] of Object.entries(dungeon.loot.statGains)) {
      newStats[stat as keyof Stats] = Math.min(200, (newStats[stat as keyof Stats] || 0) + (value || 0))
    }
    const finalGold = success ? state.gold + dungeon.loot.gold : state.gold + Math.floor(dungeon.loot.gold / 2)
    set({
      character: { ...character, stats: newStats },
      gold: finalGold,
      dungeon: { ...initialDungeon, maxFloorReached: dungeon.maxFloorReached },
      screen: "game",
    })
    if (success) get().addLog(`던전 탐험 완료! ${dungeon.floor}층 도달, ${dungeon.loot.gold}G 획득`)
    else get().addLog(`던전에서 쓰러졌습니다... ${Math.floor(dungeon.loot.gold / 2)}G만 회수`)
    get().advanceTime()
  },
}))
