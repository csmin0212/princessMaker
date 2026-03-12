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
  price?: number  // 상점 구매 가격 (없으면 상점 판매 불가)
}

export interface Weapon {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "uncommon" | "rare" | "legendary"
  attackBonus: number
  magicAttackBonus: number
  critChance?: number    // 무기 자체 치명타 확률 (0.05 = 5%)
  price?: number
  obtainMethod: string
}

export interface Material {
  id: string
  name: string
  description: string
  icon: string
  dropFrom: string   // 드롭하는 적 id
}

export interface Recipe {
  id: string
  name: string
  description: string
  icon: string
  resultType: "item" | "weapon" | "outfit" | "accessory"
  resultId: string
  resultQuantity: number
  ingredients: { id: string; quantity: number }[]  // item or material id
}

// ─── 특성 시스템 ─────────────────────────────────────────────────────────
export type PerkCategory = "combat" | "life"

export interface Perk {
  id: string
  name: string
  description: string
  icon: string
  category: PerkCategory
  cost: number          // 필요 특성 포인트 (항상 1)
  requires?: string[]   // 선행 특성 id (선행 특성 찍어야 해금)
  maxStack: number      // 최대 중첩 (기본 1)
  // 효과 (게임 로직에서 참조)
  effect: {
    attackBonus?: number        // 물리 공격력 +N (무기와 별개)
    magicBonus?: number         // 마법 공격력 +N
    goldMultiplier?: number     // 골드 배율 (1.0 기준, 0.1 = 10% 증가)
    potionBonus?: number        // 포션 회복량 배율 (0.1 = 10% 증가)
    maxPotionSlots?: number     // 포션 슬롯 +N
    statBonus?: Partial<Stats>  // 스탯 직접 보너스
    hpBonus?: number            // 던전 최대 HP +N
    xpBonus?: number            // 경험치 배율 (0.2 = 20% 증가)
    stressReduce?: number       // 주간 스트레스 감소 %
    activityBonus?: number      // 활동 스탯 배율 (0.1 = 10% 추가)
    craftSaveChance?: number    // 제작 재료 절약 확률
    goldDungeonBonus?: number   // 던전 골드 보정
    defenseBonus?: number       // 받는 피해 감소 (flat)
    critChance?: number         // 치명타 확률 (0.1 = 10%)
    critMultiplier?: number     // 치명타 데미지 배율 증가 (기본 1.5, 이 값 추가됨)
  }
}

// 특성 트리 데이터
export const PERKS: Perk[] = [
  // ── 전투 트리 Tier 1 ─────────────────────────────────────────
  { id: "atk1",       name: "공격 수련 Ⅰ",     description: "물리 공격력 +15",                        icon: "⚔️",  category: "combat", cost: 1, maxStack: 1, effect: { attackBonus: 15 } },
  { id: "magic1",     name: "마력 각성 Ⅰ",     description: "마법 공격력 +15",                        icon: "✨",  category: "combat", cost: 1, maxStack: 1, effect: { magicBonus: 15 } },
  { id: "hardy",      name: "강인한 체력",      description: "던전 최대 HP +60",                       icon: "❤️",  category: "combat", cost: 1, maxStack: 1, effect: { hpBonus: 60 } },
  { id: "potionup",   name: "포션 전문가",      description: "포션 회복량 +30%",                       icon: "🧪",  category: "combat", cost: 1, maxStack: 1, effect: { potionBonus: 0.3 } },
  { id: "xpboost",    name: "빠른 성장",        description: "던전 경험치 획득 +25%",                  icon: "📈",  category: "combat", cost: 1, maxStack: 1, effect: { xpBonus: 0.25 } },
  { id: "crit1",      name: "예리한 감각",      description: "던전 공격 시 10% 확률로 치명타 (데미지 1.5배)", icon: "🎯", category: "combat", cost: 1, maxStack: 1, effect: { critChance: 0.1 } },
  // ── 전투 트리 Tier 2 ─────────────────────────────────────────
  { id: "atk2",       name: "공격 수련 Ⅱ",     description: "물리 공격력 추가 +25",                   icon: "⚔️",  category: "combat", cost: 1, requires: ["atk1"], maxStack: 1, effect: { attackBonus: 25 } },
  { id: "magic2",     name: "마력 각성 Ⅱ",     description: "마법 공격력 추가 +25",                   icon: "✨",  category: "combat", cost: 1, requires: ["magic1"], maxStack: 1, effect: { magicBonus: 25 } },
  { id: "veteran",    name: "역전의 용사",      description: "던전 최대 HP 추가 +120",                 icon: "🛡️",  category: "combat", cost: 1, requires: ["hardy"], maxStack: 1, effect: { hpBonus: 120 } },
  { id: "potionslot", name: "포션 주머니",      description: "지참 포션 슬롯 +2",                     icon: "🎒",  category: "combat", cost: 1, requires: ["potionup"], maxStack: 1, effect: { maxPotionSlots: 2 } },
  { id: "crit2",      name: "치명적 예리함",    description: "치명타 확률 추가 +15%",                  icon: "💥",  category: "combat", cost: 1, requires: ["crit1"], maxStack: 1, effect: { critChance: 0.15 } },
  { id: "defense1",   name: "강철 피부",        description: "받는 물리 피해 -8",                     icon: "🪖",  category: "combat", cost: 1, requires: ["hardy"], maxStack: 1, effect: { defenseBonus: 8 } },
  // ── 전투 트리 Tier 3 (선행 2개 필요) ─────────────────────────
  { id: "combat-master", name: "전투 통달",     description: "물리·마법 공격력 각 +20, 최대 HP +80.", icon: "👑", category: "combat", cost: 1, requires: ["atk2", "magic2"], maxStack: 1, effect: { attackBonus: 20, magicBonus: 20, hpBonus: 80 } },
  { id: "iron-will",    name: "불굴의 의지",    description: "최대 HP +150, 받는 피해 -15.",       icon: "🔥", category: "combat", cost: 1, requires: ["veteran", "defense1"], maxStack: 1, effect: { hpBonus: 150, defenseBonus: 15 } },
  { id: "berserker",    name: "광전사",         description: "치명타 확률 +20%, 공격력 +30.",  icon: "😤", category: "combat", cost: 1, requires: ["atk2", "crit2"], maxStack: 1, effect: { attackBonus: 30, critChance: 0.2 } },
  { id: "archmage",     name: "대마법사의 길",  description: "마법 공격력 +40, 포션 회복량 +20%.",icon: "🔮", category: "combat", cost: 1, requires: ["magic2", "potionslot"], maxStack: 1, effect: { magicBonus: 40, potionBonus: 0.2 } },
  { id: "fatal-strike", name: "필살의 칼날",    description: "치명타 데미지 배율 1.5배→2.0배.",           icon: "🗡️", category: "combat", cost: 1, requires: ["crit2"], maxStack: 1, effect: { critMultiplier: 0.5 } },
  { id: "death-mark",   name: "사신의 각인",    description: "치명타 배율 +0.5, 치명타 확률 +10%.",     icon: "💀", category: "combat", cost: 1, requires: ["fatal-strike", "berserker"], maxStack: 1, effect: { critMultiplier: 0.5, critChance: 0.1 } },

  // ── 생활 트리 Tier 1 ─────────────────────────────────────────
  { id: "gold1",    name: "금전 감각 Ⅰ",   description: "일로 버는 골드 +20%",                     icon: "💰",  category: "life", cost: 1, maxStack: 1, effect: { goldMultiplier: 0.2 } },
  { id: "focus",   name: "집중력",         description: "활동으로 얻는 스탯 +10%",                 icon: "📚",  category: "life", cost: 1, maxStack: 1, effect: { activityBonus: 0.1 } },
  { id: "calm",    name: "평정심",         description: "매 주 스트레스 10% 추가 감소",             icon: "🧘",  category: "life", cost: 1, maxStack: 1, effect: { stressReduce: 0.1 } },
  { id: "craft1",  name: "손재주",         description: "제작 시 재료 절약 확률 20%",              icon: "⚒️",  category: "life", cost: 1, maxStack: 1, effect: { craftSaveChance: 0.2 } },
  { id: "lucky",   name: "행운아",         description: "던전에서 골드 드롭 +20%",                 icon: "🍀",  category: "life", cost: 1, maxStack: 1, effect: { goldDungeonBonus: 0.2 } },
  { id: "thrifty", name: "알뜰살뜰",       description: "상점 물건 가격 10% 할인.",   icon: "🏷️",  category: "life", cost: 1, maxStack: 1, effect: {} },
  // ── 생활 트리 Tier 2 ─────────────────────────────────────────
  { id: "gold2",   name: "금전 감각 Ⅱ",   description: "골드 획득 추가 +30%",                    icon: "💰",  category: "life", cost: 1, requires: ["gold1"], maxStack: 1, effect: { goldMultiplier: 0.3 } },
  { id: "focus2",  name: "극한 집중",      description: "활동 스탯 획득 추가 +20%",               icon: "📚",  category: "life", cost: 1, requires: ["focus"], maxStack: 1, effect: { activityBonus: 0.2 } },
  { id: "calm2",   name: "강철 멘탈",      description: "스트레스 감소 추가 +20%",                icon: "🧘",  category: "life", cost: 1, requires: ["calm"], maxStack: 1, effect: { stressReduce: 0.2 } },
  { id: "craft2",  name: "장인의 손",      description: "제작 재료 절약 확률 추가 +30%",          icon: "⚒️",  category: "life", cost: 1, requires: ["craft1"], maxStack: 1, effect: { craftSaveChance: 0.3 } },
  { id: "lucky2",  name: "대운",           description: "던전 골드 드롭 추가 +30%",               icon: "🍀",  category: "life", cost: 1, requires: ["lucky"], maxStack: 1, effect: { goldDungeonBonus: 0.3 } },
  // ── 생활 트리 Tier 3 ─────────────────────────────────────────
  { id: "tycoon",       name: "황금 손",        description: "골드 획득 +30%, 던전 골드 +20%.",       icon: "💎", category: "life", cost: 1, requires: ["gold2", "lucky2"], maxStack: 1, effect: { goldMultiplier: 0.3, goldDungeonBonus: 0.2 } },
  { id: "sage-life",    name: "현자의 경지",    description: "활동 스탯 +20%, 스트레스 감소 +15%.",icon: "📖", category: "life", cost: 1, requires: ["focus2", "calm2"], maxStack: 1, effect: { activityBonus: 0.2, stressReduce: 0.15 } },
  { id: "alchemist",    name: "연금술사",       description: "제작 재료 절약 +30%, 포션 회복량 +20%.",                  icon: "⚗️", category: "life", cost: 1, requires: ["craft2"], maxStack: 1, effect: { craftSaveChance: 0.3, potionBonus: 0.2 } },
]

// 레벨 경험치 테이블 (레벨당 필요 누적 XP)
export const LEVEL_XP_TABLE = [0, 50, 130, 250, 420, 650, 950, 1350, 1900, 2600, 9999]
// 인덱스 = 레벨 (1~10), 해당 값 = 그 레벨에 도달하기 위한 누적 XP
export const MAX_PERK_SLOTS = 15   // 레벨업 9 + 던전최초클리어 6
export const PERK_RESET_COST = 500  // 스킬 초기화 비용

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
  equippedWeapon: string | null
  ownedWeapons: string[]
  equippedAccessories: string[]  // 최대 2개
  ownedAccessories: string[]
  materials: { id: string; quantity: number }[]
  npcAffection: Record<string, number>   // npcId → 호감도 0~100
  npcMet: string[]                       // 만난 NPC id 목록
  npcTalkedToday: string[]               // 오늘 이미 대화한 NPC (매주 초기화)
  romancedNpc: string | null             // 로맨스 성사된 NPC id
  storyFlags: string[]                   // 스토리 플래그 (met-goddess, met-demonking, defeated-demonking 등)
  level: number           // 1~10
  xp: number              // 현재 누적 경험치
  perkPoints: number      // 사용 가능한 특성 포인트
  unlockedPerks: string[] // 해금된 특성 id 목록
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
  minYear?: number   // 최소 발생 연차 (없으면 제한 없음)
  maxYear?: number   // 최대 발생 연차
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
  xp: number              // 레벨업용 경험치
  floorRange: [number, number]
  dungeonId: DungeonId | DungeonId[]
  materialDrop?: string
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
    requirements?: Partial<Stats> & { worldKnowledge?: number; flag?: string; equippedOutfit?: string; notFlag?: string }
    outcomes: {
      description: string
      statChanges?: Partial<Stats>
      goldChange?: number
      healthChange?: number
      worldKnowledgeChange?: number
      endDungeon?: boolean
      nextFloor?: boolean
      outfitReward?: string
      startCombat?: string        // 적 id → 즉시 전투 시작
      setFlag?: string            // 스토리 플래그 설정
      specialItem?: string        // 특수 아이템 지급 (인벤토리)
    }
  }[]
}

export type DungeonId = "forest" | "valley" | "fortress" | "worldtree" | "worldsend" | "abyss"

export interface DungeonDef {
  id: DungeonId
  name: string
  icon: string
  description: string
  floors: number
  unlockAfter?: DungeonId   // 이 던전 클리어 후 해금
  worldKnowledgeReward?: number
  theme: "nature" | "ice" | "blood" | "dark" | "divine" | "void"
}

export interface DungeonState {
  active: boolean
  currentDungeonId: DungeonId | null
  floor: number
  maxFloors: number
  clearedDungeons: DungeonId[]
  maxFloorReached: number
  currentHP: number
  maxHP: number
  currentEncounter: DungeonEncounter | null
  currentEnemy: DungeonEnemy | null
  enemyHP: number
  combatLog: string[]
  loot: { gold: number; statGains: Partial<Stats>; materials: { id: string; quantity: number }[] }
  potionSlots: string[]    // 지참 포션 item id 목록 (최대 5)
  usedPotions: string[]    // 이번 던전에서 사용한 포션
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
    romancedNpc?: string
    morality?: { max?: number; min?: number }
    storyFlag?: string         // 스토리 플래그 필요
    hasItem?: string           // 특정 아이템 보유
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
  | "dungeon-select"
  | "dungeon-prep"
  | "craft"
  | "perk"
  | "dungeon-result"
  | "npc"
  | "settings"

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
  prevScreen: GameScreen
  character: Character
  gold: number
  year: number
  month: number
  week: number
  day: number
  weekSchedule: (string | null)[]
  weekResult: DayResult[] | null
  resultWeek: number   // 결과 표시용 — advanceTime 이전 week
  seasonalShopOutfits: string[]    // 현재 시즌 상점 의상 ids
  seasonalShopWeapons: string[]    // 현재 시즌 상점 무기 ids
  seasonalShopAccessories: string[] // 현재 시즌 장신구 ids
  resultMonth: number  // 결과 표시용 — advanceTime 이전 month
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
  resolveEvent: (choiceIndex: number) => void
  resolveSeasonalEvent: (choiceIndex: number) => void
  clearEventResult: () => void
  wanderingMerchantActive: boolean   // 이번 주 상인 마을 방문 여부
  wanderingMerchantOpen: boolean     // 팝업 열림 여부
  dismissWanderingMerchant: () => void  // 팝업 닫기 (상인은 여전히 마을에 있음)
  openWanderingMerchant: () => void    // 팝업 다시 열기
  buyItem: (item: Item, quantity?: number) => boolean
  useItem: (itemId: string) => boolean
  advanceTime: () => void
  checkEnding: () => Ending | null
  debugJumpTo: (year: number, month: number, week: number) => void
  getQualifiedEndings: () => Ending[]
  viewEnding: (endingId: string) => void
  setWeekSchedule: (schedule: (string | null)[]) => void
  executeWeek: () => void
  clearWeekResult: () => void
  saveGame: (slotName: string) => void
  loadGame: (slotKey: string) => boolean
  getSaveSlots: () => SaveSlot[]
  deleteSave: (slotKey: string) => void
  // 무기
  equipWeapon: (weaponId: string | null) => void
  addWeapon: (weaponId: string) => void
  buyWeapon: (weaponId: string, price: number) => boolean
  buyAccessory: (accId: string, price: number) => boolean
  equipAccessory: (accId: string) => boolean
  unequipAccessory: (accId: string) => void
  // 재료
  addMaterial: (materialId: string, qty?: number) => void
  // 던전
  selectDungeon: (dungeonId: DungeonId) => void
  setPotionSlots: (slots: string[]) => void
  usePotionInDungeon: (itemId: string) => void
  // 조합
  craftRecipe: (recipeId: string) => boolean
  _handleEnemyKill: (enemy: DungeonEnemy, log: string[]) => void
  unlockPerk: (perkId: string) => boolean
  resetPerks: () => boolean
  getPerksEffect: () => { attackBonus: number; magicBonus: number; goldMultiplier: number; potionBonus: number; maxPotionSlots: number; hpBonus: number; xpBonus: number; stressReduce: number; activityBonus: number; craftSaveChance: number; goldDungeonBonus: number; defenseBonus: number; critChance: number; critMultiplier: number }
  getAccessoriesEffect: () => { attackBonus: number; magicBonus: number; hpBonus: number; critChance: number; defenseBonus: number; goldMultiplier: number; stressReduce: number; xpBonus: number }
  // NPC
  talkToNpc: (npcId: string) => void
  giftToNpc: (npcId: string, itemId: string) => void
  dateNpc: (npcId: string) => void
  romanceNpc: (npcId: string) => void
  getMetNpcs: () => NPC[]
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
  { id: "apron", name: "앞치마 복장", description: "일할 때 입는 실용적인 복장", icon: "\u{1F45A}", category: "daily", rarity: "common", obtainMethod: "상점 구매 (50G)", price: 50 },
  { id: "scholar", name: "학자 로브", description: "학문을 연구할 때 입는 로브", icon: "\u{1F97C}", category: "formal", rarity: "uncommon", statBonuses: { intelligence: 3, magic: 2, hpBonus: 30}, obtainMethod: "상점 구매 (150G)", price: 150 },
  { id: "knight", name: "견습 기사복", description: "전투 훈련용 갑옷", icon: "\u{1F6E1}\uFE0F", category: "combat", rarity: "uncommon", statBonuses: { combat: 3, strength: 2, hpBonus: 30}, obtainMethod: "상점 구매 (200G)", price: 200 },
  { id: "party-dress", name: "파티 드레스", description: "화려한 정장 드레스", icon: "\u{1F458}", category: "formal", rarity: "uncommon", statBonuses: { charm: 5, hpBonus: 80}, obtainMethod: "상점 구매 (180G)", price: 180 },
  { id: "priestess", name: "신녀 복장", description: "신성한 의식용 복장", icon: "\u{1F4FF}", category: "formal", rarity: "rare", statBonuses: { faith: 5, morality: 3, hpBonus: 40}, obtainMethod: "동지 축제 이벤트" },
  { id: "chef", name: "요리사 복장", description: "전문 요리사의 복장", icon: "\u{1F468}\u200D\u{1F373}", category: "daily", rarity: "uncommon", statBonuses: { cooking: 5, hpBonus: 50}, obtainMethod: "수확제 요리 대회 우승" },
  { id: "flower-crown", name: "꽃의 여왕 드레스", description: "봄 축제 여왕의 특별한 드레스", icon: "\u{1F338}", category: "special", rarity: "rare", statBonuses: { charm: 8, creativity: 3, hpBonus: 30}, obtainMethod: "꽃축제 꽃꽂이 대회 우승" },
  { id: "swimsuit", name: "해변 원피스", description: "시원하고 경쾌한 여름 복장", icon: "\u{1F459}", category: "daily", rarity: "uncommon", obtainMethod: "바다 축제 수영 대회 우승" },
  { id: "witch", name: "마녀 로브", description: "신비로운 마법사의 로브", icon: "\u{1F9D9}\u200D\u2640\uFE0F", category: "special", rarity: "rare", statBonuses: { magic: 8, intelligence: 3, hpBonus: 20}, obtainMethod: "던전 마녀의 방 클리어" },
  { id: "holy-knight", name: "성기사 갑옷", description: "세계의 끝 던전에서 여신의 현현을 만나 경배할 때 획득", icon: "\u2694\uFE0F", category: "combat", rarity: "legendary", statBonuses: { combat: 8, faith: 5, morality: 3, hpBonus: 60}, obtainMethod: "세계의 끝 — 여신의 현현" },
  { id: "dark-knight", name: "암흑 기사 갑옷", description: "무저갱에서 마왕의 그림자를 만나 거래할 때 획득", icon: "\u{1F5A4}", category: "combat", rarity: "legendary", statBonuses: { combat: 10, magic: 5, morality: -5, hpBonus: 120}, obtainMethod: "무저갱 — 마왕과의 계약" },
  { id: "celestial", name: "천상의 드레스", description: "세계의 이해도 80%를 달성하면 자동으로 얻는 전설의 드레스", icon: "\u2728", category: "special", rarity: "legendary", statBonuses: { charm: 5, magic: 5, faith: 5, intelligence: 5, hpBonus: 130}, obtainMethod: "세계의 이해도 80% 달성" },
  { id: "birthday-dress", name: "생일 드레스", description: "축하의 기운이 깃든 드레스", icon: "\u{1F382}", category: "special", rarity: "rare", statBonuses: { charm: 4, morality: 2, hpBonus: 100}, obtainMethod: "생일 이벤트" },
  { id: "dragon-armor", name: "용린 갑옷", description: "드래곤의 비늘로 만든 전설의 갑옷", icon: "\u{1F432}", category: "combat", rarity: "legendary", statBonuses: { combat: 12, strength: 5, magic: 5, hpBonus: 50}, obtainMethod: "던전 40층 보스 처치" },
  { id: "void-robe", name: "공허의 로브", description: "심연에서 건져올린 무(無)의 옷", icon: "\u{1F30C}", category: "special", rarity: "legendary", statBonuses: { magic: 12, intelligence: 8, faith: -5, hpBonus: 160}, obtainMethod: "던전 50층 도달" },
  // ── 스토리 전용 의상 ─────────────────────────────────────────
  { id: "demonking-armor",   name: "마왕의 흉갑",    description: "마왕이 하사한 전설의 흉갑. 강력한 어둠의 힘이 깃들어 있다. 여신 앞에 입고 서면...", icon: "👿", category: "combat", rarity: "legendary", statBonuses: { combat: 15, magic: 8, strength: 8, morality: -5, hpBonus: 200}, obtainMethod: "히든 스토리" },
  // ── 제작 의상 ────────────────────────────────────────────
  { id: "forest-cloak",    name: "숲의 망토",      description: "변방의 숲 재료로 만든 경량 전투복",     icon: "🧥", category: "combat",  rarity: "uncommon", statBonuses: { combat: 4, strength: 2 },          obtainMethod: "제작" },
  { id: "frost-robe",      name: "서리 로브",       description: "설원의 마법 에너지를 담은 로브",        icon: "🌨️", category: "formal",  rarity: "rare",     statBonuses: { magic: 6, intelligence: 3, hpBonus: 60},       obtainMethod: "제작" },
  { id: "bone-armor",      name: "성채 갑옷",       description: "핏빛 성채의 재료로 단조한 중갑옷",      icon: "🛡️", category: "combat",  rarity: "rare",     statBonuses: { combat: 7, strength: 4, hpBonus: 50},          obtainMethod: "제작" },
  { id: "worldtree-robe",  name: "세계수 드레스",   description: "세계수의 정기가 깃든 신비로운 드레스",   icon: "🌿", category: "special", rarity: "rare",     statBonuses: { magic: 5, creativity: 4, faith: 2, hpBonus: 100}, obtainMethod: "제작" },
  { id: "holy-robe",       name: "신성한 로브",     description: "신성한 깃털로 짠 여신의 로브",          icon: "🪶", category: "formal",  rarity: "legendary",statBonuses: { faith: 8, morality: 5, magic: 3, hpBonus: 70}, obtainMethod: "제작" },
  { id: "abyss-armor",     name: "심연의 갑옷",     description: "심연의 핵으로 만든 궁극의 전투복",      icon: "⬛", category: "combat",  rarity: "legendary",statBonuses: { combat: 12, magic: 6, strength: 4, hpBonus: 80}, obtainMethod: "제작" },
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
  equippedWeapon: null, ownedWeapons: [], equippedAccessories: [], ownedAccessories: [],
  materials: [],
  npcAffection: {},
  npcMet: [],
  npcTalkedToday: [],
  romancedNpc: null,
  storyFlags: [],
  level: 1, xp: 0, perkPoints: 0, unlockedPerks: [],
  profileImage: null,
}

const initialDungeon: DungeonState = {
  active: false, currentDungeonId: null, floor: 0, maxFloors: 20,
  clearedDungeons: [], maxFloorReached: 0,
  currentHP: 100, maxHP: 100,
  currentEncounter: null, currentEnemy: null, enemyHP: 0,
  combatLog: [], loot: { gold: 0, statGains: {}, materials: [] },
  potionSlots: [], usedPotions: [],
}

// ─── 던전 정의 ─────────────────────────────────────────────────────────
export const DUNGEONS: DungeonDef[] = [
  { id: "forest",    name: "변방의 숲",   icon: "🌲", description: "마을 외곽의 위험한 숲. 입문자의 던전.",                    floors: 20, theme: "nature" },
  { id: "valley",    name: "설원 골짜기", icon: "❄️", description: "얼어붙은 협곡. 한기가 뼛속까지 파고든다.",               floors: 20, theme: "ice",    unlockAfter: "forest" },
  { id: "fortress",  name: "핏빛 성채",   icon: "🏯", description: "피로 물든 고성. 수많은 용병들이 쓰러진 곳.",             floors: 20, theme: "blood",  unlockAfter: "valley" },
  { id: "worldtree", name: "검은 세계수", icon: "🌑", description: "부패한 세계수의 뿌리. 어둠이 깃든 신성한 곳.",           floors: 20, theme: "dark",   unlockAfter: "fortress" },
  { id: "worldsend", name: "세계의 끝",   icon: "✨", description: "세계가 끝나는 곳. 여신의 발자취가 남아 있다.", worldKnowledgeReward: 30, floors: 30, theme: "divine",  unlockAfter: "worldtree" },
  { id: "abyss",     name: "무저갱",      icon: "🕳️", description: "끝없이 내려가는 심연. 마왕의 숨결이 느껴진다.", worldKnowledgeReward: 50, floors: 50, theme: "void" },
]

// ─── 무기 ───────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────
// 장신구
// ────────────────────────────────────────────────────────────────
export interface Accessory {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "uncommon" | "rare" | "legendary"
  price?: number            // 상점 구매 가격
  obtainMethod: string
  effect: {
    hpBonus?: number        // 최대 HP 증가
    attackBonus?: number    // 물리 공격력
    magicBonus?: number     // 마법 공격력
    critChance?: number     // 치명타 확률
    defenseBonus?: number   // 피해 감소
    goldMultiplier?: number // 골드 수입 %
    stressReduce?: number   // 스트레스 감소 %
    xpBonus?: number        // 경험치 %
  }
}

export const ACCESSORIES: Accessory[] = [
  // ── 상시 판매 ──────────────────────────────────────────────
  { id: "leather-bracelet", name: "가죽 팔찌",   icon: "🟤", rarity: "common",   price: 80,  obtainMethod: "상점", description: "튼튼한 가죽 팔찌", effect: { hpBonus: 45 } },
  { id: "copper-ring",      name: "구리 반지",   icon: "🟠", rarity: "common",   price: 90,  obtainMethod: "상점", description: "구리로 만든 반지", effect: { attackBonus: 5 } },
  { id: "glass-bead",       name: "유리구슬 목걸이", icon: "🔵", rarity: "common",  price: 70,  obtainMethod: "상점", description: "맑은 유리 목걸이", effect: { magicBonus: 5 } },
  { id: "iron-bangle",      name: "철제 방호구", icon: "⚫", rarity: "uncommon", price: 180, obtainMethod: "상점", description: "방어에 특화된 철제 완장", effect: { defenseBonus: 5, hpBonus: 60 } },
  { id: "lucky-charm",      name: "행운의 부적", icon: "🟡", rarity: "uncommon", price: 200, obtainMethod: "상점", description: "행운이 깃든 부적", effect: { critChance: 0.05, goldMultiplier: 0.1 } },
  { id: "scholar-pendant",  name: "학자의 목걸이",icon: "🟣", rarity: "uncommon", price: 220, obtainMethod: "상점", description: "경험치 획득 증가", effect: { xpBonus: 0.15, magicBonus: 8 } },
  // ── 계절 한정 ──────────────────────────────────────────────
  { id: "spring-flower-pin","name": "봄꽃 핀",    icon: "🌸", rarity: "uncommon", price: 260, obtainMethod: "계절 상점 (봄)", description: "봄꽃의 기운이 깃든 핀", effect: { critChance: 0.07, stressReduce: 0.1 } },
  { id: "summer-shell",     name: "바다 조개 목걸이",icon:"🐚",rarity: "uncommon", price: 280, obtainMethod: "계절 상점 (여름)", description: "여름 바다의 기운", effect: { magicBonus: 10, hpBonus: 75 } },
  { id: "autumn-amber",     name: "호박 목걸이",  icon: "🍂", rarity: "rare",     price: 350, obtainMethod: "계절 상점 (가을)", description: "가을의 정수가 담긴 호박", effect: { attackBonus: 12, critChance: 0.06 } },
  { id: "winter-crystal",   name: "빙정 반지",    icon: "❄️", rarity: "rare",     price: 380, obtainMethod: "계절 상점 (겨울)", description: "얼음처럼 차갑고 단단한 반지", effect: { defenseBonus: 10, hpBonus: 120 } },
  // ── 연도 기념 한정 ────────────────────────────────────────
  { id: "year1-medal",      name: "1년 기념 메달", icon: "🥇", rarity: "rare",    price: 450, obtainMethod: "연도 한정 (1년)", description: "1년을 버텨낸 증표", effect: { attackBonus: 8, magicBonus: 8, critChance: 0.05 } },
  { id: "year2-medal",      name: "2년 기념 메달", icon: "🏅", rarity: "rare",    price: 500, obtainMethod: "연도 한정 (2년)", description: "2년의 여정을 담은 메달", effect: { hpBonus: 180, defenseBonus: 8, goldMultiplier: 0.1 } },
  { id: "year3-medal",      name: "3년 기념 메달", icon: "🎖️", rarity: "legendary",price: 600, obtainMethod: "연도 한정 (3년)", description: "전설의 영역에 도달한 자의 증표", effect: { attackBonus: 15, magicBonus: 15, critChance: 0.08, xpBonus: 0.1 } },
  // ── 제작 장신구 ──────────────────────────────────────────
  { id: "fang-ring",        name: "늑대 송곳니 반지",  icon: "🦷", rarity: "uncommon", obtainMethod: "제작", description: "야수의 날카로움이 깃든 반지", effect: { attackBonus: 8, critChance: 0.05 } },
  { id: "slime-amulet",     name: "슬라임 호신부",     icon: "💚", rarity: "common",   obtainMethod: "제작", description: "슬라임의 끈질긴 생명력", effect: { hpBonus: 90 } },
  { id: "frost-earring",    name: "서리 귀걸이",       icon: "🔷", rarity: "uncommon", obtainMethod: "제작", description: "빙결의 마력이 깃든 귀걸이", effect: { magicBonus: 10 } },
  { id: "bone-ward",        name: "해골 호부",         icon: "🦴", rarity: "uncommon", obtainMethod: "제작", description: "죽은 자의 힘으로 방어력 강화", effect: { defenseBonus: 7, hpBonus: 60 } },
  { id: "troll-band",       name: "트롤 완장",         icon: "🟤", rarity: "rare",     obtainMethod: "제작", description: "트롤 가죽으로 만든 완장. 강인한 생명력", effect: { hpBonus: 150, defenseBonus: 5 } },
  { id: "dragon-ring",      name: "용린 반지",         icon: "🐉", rarity: "rare",     obtainMethod: "제작", description: "용의 비늘로 만든 반지. 공격과 방어를 강화", effect: { attackBonus: 12, defenseBonus: 8 } },
  { id: "frost-core-bangle",name: "빙핵 팔찌",         icon: "❄️", rarity: "rare",     obtainMethod: "제작", description: "빙핵의 냉기가 마법력을 증폭시킨다", effect: { magicBonus: 15, hpBonus: 90 } },
  { id: "ruby-necklace",    name: "루비 목걸이",       icon: "♦️", rarity: "rare",     obtainMethod: "제작", description: "핏빛 루비의 힘. 치명타가 강화된다", effect: { attackBonus: 10, critChance: 0.08 } },
  { id: "world-root-ring",  name: "세계수 뿌리 반지",  icon: "🌿", rarity: "legendary",obtainMethod: "제작", description: "세계수의 생명력이 경험치 획득을 높인다", effect: { xpBonus: 0.25, hpBonus: 120 } },
  { id: "goddess-tear-necklace", name: "여신의 눈물 목걸이", icon: "💧", rarity: "legendary", obtainMethod: "제작", description: "여신의 눈물이 깃든 전설의 목걸이", effect: { attackBonus: 15, magicBonus: 15, critChance: 0.07 } },
  { id: "abyss-ring",       name: "심연의 반지",       icon: "🕳️", rarity: "legendary",obtainMethod: "제작", description: "심연의 핵으로 만든 반지. 모든 전투 능력 극대화", effect: { attackBonus: 20, magicBonus: 20, critChance: 0.10 } },
]

export const WEAPONS: Weapon[] = [
  // 상점 구매 (Common/Uncommon)
  { id: "wooden-sword",  name: "나무 검",       icon: "🪵", rarity: "common",    attackBonus: 12, magicAttackBonus: 0,  price: 80,  obtainMethod: "상점" },
  { id: "bow",           name: "사냥꾼의 활",   icon: "🏹", rarity: "common",    attackBonus: 10, magicAttackBonus: 0,  critChance: 0.08, price: 120, obtainMethod: "상점", description: "빠른 연사가 가능한 활. 치명타 확률 +8%." },
  { id: "iron-sword",    name: "철제 검",        icon: "⚔️", rarity: "uncommon",  attackBonus: 28, magicAttackBonus: 0,  price: 200, obtainMethod: "상점" },
  { id: "magic-staff",   name: "마법 지팡이",   icon: "🪄", rarity: "uncommon",  attackBonus: 5,  magicAttackBonus: 32, price: 220, obtainMethod: "상점" },
  { id: "assassin-dagger",name: "암살자의 단검", icon: "🔪", rarity: "uncommon",  attackBonus: 18, magicAttackBonus: 0,  critChance: 0.15, price: 280, obtainMethod: "상점", description: "날카로운 단검. 치명타 확률 +15%." },
  // 조합 (Rare)
  { id: "silver-blade",  name: "은빛 검",        icon: "🗡️", rarity: "rare",      attackBonus: 45, magicAttackBonus: 10, obtainMethod: "조합" },
  { id: "flame-sword",   name: "화염검",         icon: "🔥", rarity: "rare",      attackBonus: 42, magicAttackBonus: 28, obtainMethod: "조합" },
  { id: "crystal-wand",  name: "수정 완드",      icon: "💎", rarity: "rare",      attackBonus: 0,  magicAttackBonus: 55, critChance: 0.10, obtainMethod: "조합", description: "마법 치명타 확률 +10%." },
  { id: "shadow-blade",  name: "그림자 검",      icon: "🌑", rarity: "rare",      attackBonus: 35, magicAttackBonus: 5,  critChance: 0.20, obtainMethod: "조합", description: "어둠에 깃든 검. 치명타 확률 +20%." },
  // 조합 (Legendary)
  { id: "holy-sword",    name: "성검",            icon: "💫", rarity: "legendary", attackBonus: 72, magicAttackBonus: 52, obtainMethod: "조합" },
  { id: "void-blade",    name: "공허의 검",       icon: "🌀", rarity: "legendary", attackBonus: 62, magicAttackBonus: 72, obtainMethod: "조합" },
  { id: "crimson-fang",  name: "붉은 송곳니",    icon: "🦷", rarity: "legendary", attackBonus: 80, magicAttackBonus: 20, critChance: 0.25, obtainMethod: "조합", description: "야수의 힘이 깃든 전설의 무기. 치명타 확률 +25%." },
  // ── 계절 한정 ──────────────────────────────────────────────────
  { id: "coral-wand",        name: "산호 완드",      icon: "🪸", rarity: "rare",      attackBonus: 10, magicAttackBonus: 42, price: 400, obtainMethod: "계절 상점 (여름)", description: "여름 바다의 마력이 깃든 완드" },
  { id: "autumn-blade",      name: "단풍 단검",      icon: "🍁", rarity: "rare",      attackBonus: 38, magicAttackBonus: 8,  critChance: 0.12, price: 420, obtainMethod: "계절 상점 (가을)", description: "가을의 날카로움을 담은 단검. 치명타 확률 +12%." },
  { id: "frost-lance",       name: "서리 창",        icon: "🧊", rarity: "rare",      attackBonus: 44, magicAttackBonus: 20, price: 440, obtainMethod: "계절 상점 (겨울)", description: "얼어붙은 창. 견고하고 차갑다." },
  // ── 연도 한정 ──────────────────────────────────────────────────
  { id: "silver-hunter-bow", name: "은빛 사냥 활",   icon: "🏹", rarity: "rare",      attackBonus: 42, magicAttackBonus: 5,  critChance: 0.18, price: 500, obtainMethod: "연도 한정 (2년)", description: "2년차 사냥꾼의 은빛 활. 치명타 확률 +18%." },
  { id: "ancient-sword",     name: "고대의 검",      icon: "🗡️", rarity: "legendary", attackBonus: 58, magicAttackBonus: 30, critChance: 0.10, price: 650, obtainMethod: "연도 한정 (3년)", description: "고대 왕국의 전설적인 검." },
]

// ─── 재료 ───────────────────────────────────────────────────────────────
export const MATERIALS: Material[] = [
  { id: "wolf-fang",      name: "늑대 송곳니",  icon: "🦷", dropFrom: "wolf" },
  { id: "goblin-ear",     name: "고블린 귀",    icon: "👂", dropFrom: "goblin" },
  { id: "slime-gel",      name: "슬라임 젤",    icon: "💚", dropFrom: "slime" },
  { id: "skeleton-bone",  name: "해골 뼈",      icon: "🦴", dropFrom: "skeleton" },
  { id: "orc-tusk",       name: "오크 어금니",  icon: "🐗", dropFrom: "orc" },
  { id: "frost-crystal",  name: "서리 결정",    icon: "🔷", dropFrom: "frost-wolf" },
  { id: "troll-hide",     name: "트롤 가죽",    icon: "🟤", dropFrom: "ice-troll" },
  { id: "wraith-essence", name: "망령의 정수",  icon: "💜", dropFrom: "fortress-wraith" },
  { id: "dark-sap",       name: "검은 수액",    icon: "🖤", dropFrom: "dark-treant" },
  { id: "divine-feather", name: "신성한 깃털",  icon: "🪶", dropFrom: "seraph-guardian" },
  { id: "void-shard",     name: "공허의 파편",  icon: "⬛", dropFrom: "void-shade" },
  { id: "dragon-scale",   name: "용의 비늘",    icon: "🐉", dropFrom: "boss-forest" },
  { id: "frost-core",     name: "빙핵",         icon: "❄️", dropFrom: "boss-valley" },
  { id: "blood-ruby",     name: "핏빛 루비",    icon: "♦️", dropFrom: "boss-fortress" },
  { id: "world-root",     name: "세계수 뿌리",  icon: "🌿", dropFrom: "boss-worldtree" },
  { id: "goddess-tear",   name: "여신의 눈물",  icon: "💧", dropFrom: "boss-worldsend" },
  { id: "abyss-core",     name: "심연의 핵",    icon: "🕳️", dropFrom: "boss-abyss" },
]

// ─── 레시피 ─────────────────────────────────────────────────────────────
export const RECIPES: Recipe[] = [
  // ── 아이템 (8종) ──────────────────────────────────────────────────────
  { id: "mega-potion",       name: "고급 치유 물약",    description: "HP를 80 회복한다",             icon: "🧪", resultType: "item",      resultId: "mega-healing",        resultQuantity: 1, ingredients: [{ id: "healing-potion", quantity: 2 }, { id: "slime-gel", quantity: 2 }] },
  { id: "calm-elixir-r",     name: "정화 엘릭서",       description: "스트레스를 50 감소시킨다",     icon: "✨", resultType: "item",      resultId: "calm-elixir",         resultQuantity: 1, ingredients: [{ id: "stress-tea", quantity: 2 }, { id: "wolf-fang", quantity: 1 }] },
  { id: "vitality-elixir-r", name: "활력의 비약",       description: "HP 40, 스트레스 30 동시 회복", icon: "💚", resultType: "item",      resultId: "vitality-elixir",     resultQuantity: 1, ingredients: [{ id: "slime-gel", quantity: 2 }, { id: "frost-crystal", quantity: 1 }] },
  { id: "frost-vial-r",      name: "서리 물약",         description: "HP를 60 회복한다",             icon: "🔷", resultType: "item",      resultId: "frost-vial",          resultQuantity: 1, ingredients: [{ id: "frost-crystal", quantity: 2 }, { id: "troll-hide", quantity: 1 }] },
  { id: "world-elixir-r",    name: "세계수 엘릭서",     description: "HP 60, 스트레스 40 동시 회복", icon: "🌿", resultType: "item",      resultId: "world-elixir",        resultQuantity: 1, ingredients: [{ id: "world-root", quantity: 1 }, { id: "dark-sap", quantity: 2 }] },
  { id: "battle-tonic-r",    name: "전투 강화제",       description: "HP를 30 회복한다",             icon: "⚔️",  resultType: "item",      resultId: "battle-tonic",        resultQuantity: 1, ingredients: [{ id: "wolf-fang", quantity: 2 }, { id: "dragon-scale", quantity: 1 }] },
  { id: "dark-potion-r",     name: "심연의 포션",       description: "HP를 120 회복한다",            icon: "🕳️", resultType: "item",      resultId: "dark-potion",         resultQuantity: 1, ingredients: [{ id: "void-shard", quantity: 2 }, { id: "abyss-core", quantity: 1 }] },
  { id: "goddess-grace-r",   name: "여신의 은총",       description: "HP를 150 완전 회복한다",       icon: "💧", resultType: "item",      resultId: "goddess-grace",       resultQuantity: 1, ingredients: [{ id: "divine-feather", quantity: 2 }, { id: "goddess-tear", quantity: 1 }] },

  // ── 무기 (9종) ──────────────────────────────────────────────────────────
  { id: "silver-blade-r",    name: "은빛 검 제작",      description: "균형 잡힌 고급 검",            icon: "🗡️", resultType: "weapon",    resultId: "silver-blade",        resultQuantity: 1, ingredients: [{ id: "iron-sword", quantity: 1 }, { id: "frost-crystal", quantity: 3 }, { id: "troll-hide", quantity: 2 }] },
  { id: "flame-sword-r",     name: "화염검 제작",       description: "불꽃이 깃든 검",               icon: "🔥", resultType: "weapon",    resultId: "flame-sword",         resultQuantity: 1, ingredients: [{ id: "iron-sword", quantity: 1 }, { id: "dragon-scale", quantity: 2 }, { id: "blood-ruby", quantity: 1 }] },
  { id: "crystal-wand-r",    name: "수정 완드 제작",    description: "마법 특화 지팡이",             icon: "💎", resultType: "weapon",    resultId: "crystal-wand",        resultQuantity: 1, ingredients: [{ id: "magic-staff", quantity: 1 }, { id: "frost-core", quantity: 2 }, { id: "void-shard", quantity: 1 }] },
  { id: "shadow-blade-r",    name: "그림자 검 제작",    description: "치명타 특화 검",               icon: "🌑", resultType: "weapon",    resultId: "shadow-blade",        resultQuantity: 1, ingredients: [{ id: "iron-sword", quantity: 1 }, { id: "wraith-essence", quantity: 3 }, { id: "void-shard", quantity: 2 }] },
  { id: "holy-sword-r",      name: "성검 제작",         description: "여신의 가호가 깃든 전설의 검", icon: "💫", resultType: "weapon",    resultId: "holy-sword",          resultQuantity: 1, ingredients: [{ id: "silver-blade", quantity: 1 }, { id: "goddess-tear", quantity: 1 }, { id: "divine-feather", quantity: 3 }] },
  { id: "void-blade-r",      name: "공허의 검 제작",    description: "심연에서 태어난 전설의 검",    icon: "🌀", resultType: "weapon",    resultId: "void-blade",          resultQuantity: 1, ingredients: [{ id: "silver-blade", quantity: 1 }, { id: "abyss-core", quantity: 1 }, { id: "void-shard", quantity: 3 }] },
  { id: "crimson-fang-r",    name: "붉은 송곳니 제작",  description: "야수의 힘이 깃든 전설의 무기", icon: "🦷", resultType: "weapon",    resultId: "crimson-fang",        resultQuantity: 1, ingredients: [{ id: "silver-blade", quantity: 1 }, { id: "wolf-fang", quantity: 5 }, { id: "dragon-scale", quantity: 3 }, { id: "blood-ruby", quantity: 2 }] },
  { id: "dark-sap-staff-r",  name: "세계수 완드 제작",  description: "세계수의 어둠을 담은 완드",    icon: "🖤", resultType: "weapon",    resultId: "crystal-wand",        resultQuantity: 1, ingredients: [{ id: "dark-sap", quantity: 3 }, { id: "world-root", quantity: 1 }, { id: "magic-staff", quantity: 1 }] },
  { id: "bone-lance-r",      name: "해골 창 제작",      description: "해골 뼈로 만든 강인한 무기",   icon: "🦴", resultType: "weapon",    resultId: "silver-blade",        resultQuantity: 1, ingredients: [{ id: "skeleton-bone", quantity: 5 }, { id: "orc-tusk", quantity: 2 }, { id: "iron-sword", quantity: 1 }] },

  // ── 의상 (6종) ──────────────────────────────────────────────────────────
  { id: "forest-cloak-r",    name: "숲의 망토 제작",    description: "경량 전투복",                  icon: "🧥", resultType: "outfit",    resultId: "forest-cloak",        resultQuantity: 1, ingredients: [{ id: "wolf-fang", quantity: 3 }, { id: "goblin-ear", quantity: 3 }, { id: "slime-gel", quantity: 2 }] },
  { id: "frost-robe-r",      name: "서리 로브 제작",    description: "설원의 마법 로브",             icon: "🌨️", resultType: "outfit",    resultId: "frost-robe",          resultQuantity: 1, ingredients: [{ id: "frost-crystal", quantity: 4 }, { id: "troll-hide", quantity: 2 }, { id: "orc-tusk", quantity: 1 }] },
  { id: "bone-armor-r",      name: "성채 갑옷 제작",    description: "성채의 강철 갑옷",             icon: "🛡️", resultType: "outfit",    resultId: "bone-armor",          resultQuantity: 1, ingredients: [{ id: "skeleton-bone", quantity: 4 }, { id: "blood-ruby", quantity: 1 }, { id: "wraith-essence", quantity: 2 }] },
  { id: "worldtree-robe-r",  name: "세계수 드레스 제작",description: "세계수의 정기 드레스",         icon: "🌿", resultType: "outfit",    resultId: "worldtree-robe",      resultQuantity: 1, ingredients: [{ id: "dark-sap", quantity: 3 }, { id: "world-root", quantity: 1 }, { id: "divine-feather", quantity: 1 }] },
  { id: "holy-robe-r",       name: "신성한 로브 제작",  description: "여신의 신성한 로브",           icon: "🪶", resultType: "outfit",    resultId: "holy-robe",           resultQuantity: 1, ingredients: [{ id: "divine-feather", quantity: 3 }, { id: "goddess-tear", quantity: 1 }, { id: "world-root", quantity: 1 }] },
  { id: "abyss-armor-r",     name: "심연의 갑옷 제작",  description: "궁극의 전투복",                icon: "⬛", resultType: "outfit",    resultId: "abyss-armor",         resultQuantity: 1, ingredients: [{ id: "abyss-core", quantity: 1 }, { id: "void-shard", quantity: 3 }, { id: "dragon-scale", quantity: 2 }] },

  // ── 장신구 (11종) ──────────────────────────────────────────────────────
  { id: "fang-ring-r",        name: "늑대 반지 제작",       description: "야수의 날카로움",           icon: "🦷", resultType: "accessory", resultId: "fang-ring",           resultQuantity: 1, ingredients: [{ id: "wolf-fang", quantity: 4 }, { id: "goblin-ear", quantity: 2 }] },
  { id: "slime-amulet-r",     name: "슬라임 호신부 제작",   description: "끈질긴 생명력",             icon: "💚", resultType: "accessory", resultId: "slime-amulet",        resultQuantity: 1, ingredients: [{ id: "slime-gel", quantity: 5 }, { id: "skeleton-bone", quantity: 2 }] },
  { id: "frost-earring-r",    name: "서리 귀걸이 제작",     description: "빙결의 마력",               icon: "🔷", resultType: "accessory", resultId: "frost-earring",       resultQuantity: 1, ingredients: [{ id: "frost-crystal", quantity: 3 }, { id: "orc-tusk", quantity: 1 }] },
  { id: "bone-ward-r",        name: "해골 호부 제작",       description: "죽은 자의 방어력",          icon: "🦴", resultType: "accessory", resultId: "bone-ward",           resultQuantity: 1, ingredients: [{ id: "skeleton-bone", quantity: 4 }, { id: "wraith-essence", quantity: 1 }] },
  { id: "troll-band-r",       name: "트롤 완장 제작",       description: "강인한 생명력",             icon: "🟤", resultType: "accessory", resultId: "troll-band",          resultQuantity: 1, ingredients: [{ id: "troll-hide", quantity: 3 }, { id: "frost-core", quantity: 1 }] },
  { id: "dragon-ring-r",      name: "용린 반지 제작",       description: "공격과 방어를 강화",        icon: "🐉", resultType: "accessory", resultId: "dragon-ring",         resultQuantity: 1, ingredients: [{ id: "dragon-scale", quantity: 2 }, { id: "blood-ruby", quantity: 1 }] },
  { id: "frost-core-bangle-r",name: "빙핵 팔찌 제작",       description: "마법력 증폭 팔찌",          icon: "❄️", resultType: "accessory", resultId: "frost-core-bangle",   resultQuantity: 1, ingredients: [{ id: "frost-core", quantity: 1 }, { id: "frost-crystal", quantity: 3 }, { id: "troll-hide", quantity: 1 }] },
  { id: "ruby-necklace-r",    name: "루비 목걸이 제작",     description: "치명타를 강화하는 목걸이",  icon: "♦️", resultType: "accessory", resultId: "ruby-necklace",       resultQuantity: 1, ingredients: [{ id: "blood-ruby", quantity: 2 }, { id: "wraith-essence", quantity: 2 }] },
  { id: "world-root-ring-r",  name: "세계수 반지 제작",     description: "경험치 획득 증가 반지",     icon: "🌿", resultType: "accessory", resultId: "world-root-ring",     resultQuantity: 1, ingredients: [{ id: "world-root", quantity: 2 }, { id: "dark-sap", quantity: 2 }, { id: "divine-feather", quantity: 1 }] },
  { id: "goddess-necklace-r", name: "여신의 목걸이 제작",   description: "여신의 눈물이 깃든 전설",   icon: "💧", resultType: "accessory", resultId: "goddess-tear-necklace",resultQuantity: 1, ingredients: [{ id: "goddess-tear", quantity: 1 }, { id: "divine-feather", quantity: 2 }, { id: "world-root", quantity: 1 }] },
  { id: "abyss-ring-r",       name: "심연의 반지 제작",     description: "모든 전투 능력 극대화",     icon: "🕳️", resultType: "accessory", resultId: "abyss-ring",          resultQuantity: 1, ingredients: [{ id: "abyss-core", quantity: 1 }, { id: "void-shard", quantity: 4 }, { id: "goddess-tear", quantity: 1 }] },
]


// 조합 결과 아이템 (인벤토리에 추가될 것들)
export const CRAFTED_ITEMS: Item[] = [
  { id: "mega-healing",    name: "고급 치유 물약",  description: "HP를 80 회복한다",       effect: { health: 80 },              price: 0, icon: "🧪" },
  { id: "calm-elixir",     name: "정화 엘릭서",     description: "스트레스를 50 감소",      effect: { stress: -50 },             price: 0, icon: "✨" },
  { id: "vitality-elixir", name: "활력의 비약",     description: "HP 40 회복, 스트레스 30 감소", effect: { health: 40, stress: -30 }, price: 0, icon: "💚" },
  { id: "battle-tonic",    name: "전투 강화제",     description: "HP를 30 회복한다",       effect: { health: 30 },              price: 0, icon: "⚔️" },
  { id: "goddess-grace",   name: "여신의 은총",     description: "HP를 150 완전 회복한다",  effect: { health: 150 },             price: 0, icon: "💧" },
  { id: "dark-potion",     name: "심연의 포션",     description: "HP를 120 회복한다",      effect: { health: 120 },             price: 0, icon: "🕳️" },
  { id: "world-elixir",    name: "세계수 엘릭서",   description: "HP 60 회복, 스트레스 40 감소", effect: { health: 60, stress: -40 }, price: 0, icon: "🌿" },
  { id: "frost-vial",      name: "서리 물약",       description: "HP를 60 회복한다",       effect: { health: 60 },              price: 0, icon: "🔷" },
  { id: "goddess-tear-blessed", name: "여신의 눈물", description: "세계의 구원자를 위해 여신이 흘린 눈물. 경이로운 빛을 발한다.", effect: { health: 0 }, price: 0, icon: "✨" },
]

// Activities (same as before)
export const ACTIVITIES: Activity[] = [
  { id: "study-science", name: "과학 공부", description: "과학 서적을 읽고 실험합니다", category: "study", statChanges: {intelligence: 3, creativity: 1}, stressChange: 5, goldChange: 0, duration: 1, icon: "\u{1F52C}" },
  { id: "study-literature", name: "문학 공부", description: "시와 소설을 읽습니다", category: "study", statChanges: {intelligence: 2, charm: 1, creativity: 2}, stressChange: 3, goldChange: 0, duration: 1, icon: "\u{1F4DA}" },
  { id: "study-theology", name: "신학 공부", description: "종교와 철학을 배웁니다", category: "study", statChanges: {faith: 3, morality: 2, intelligence: 1}, stressChange: 4, goldChange: 0, duration: 1, icon: "\u{1F64F}" },
  { id: "study-magic", name: "마법 수업", description: "마법의 기초를 배웁니다", category: "study", statChanges: {magic: 3, intelligence: 1}, stressChange: 6, goldChange: -30, duration: 1, icon: "\u2728" },
  { id: "study-etiquette", name: "예절 수업", description: "귀족의 예절을 배웁니다", category: "study", statChanges: {charm: 3, morality: 1}, stressChange: 4, goldChange: -20, duration: 1, icon: "\u{1F380}" },
  { id: "study-art", name: "미술 수업", description: "그림과 조각을 배웁니다", category: "study", statChanges: {creativity: 4, charm: 1}, stressChange: 2, goldChange: -25, duration: 1, icon: "\u{1F3A8}" },
  { id: "work-farm", name: "농장 일", description: "농장에서 일합니다", category: "work", statChanges: {strength: 2, housework: 1}, stressChange: 4, goldChange: 30, duration: 1, icon: "\u{1F33E}" },
  { id: "work-inn", name: "여관 일", description: "여관에서 서빙합니다", category: "work", statChanges: {charm: 1, cooking: 2, housework: 1}, stressChange: 5, goldChange: 40, duration: 1, icon: "\u{1F37D}\uFE0F" },
  { id: "work-church", name: "교회 봉사", description: "교회에서 봉사합니다", category: "work", statChanges: {faith: 2, morality: 2}, stressChange: 2, goldChange: 15, duration: 1, icon: "\u26EA" },
  { id: "work-hunter", name: "사냥 도우미", description: "사냥꾼을 돕습니다", category: "work", statChanges: {combat: 2, strength: 1}, stressChange: 6, goldChange: 50, duration: 1, requirements: { strength: 30 }, icon: "\u{1F3F9}" },
  { id: "work-tutor", name: "과외 선생", description: "어린 아이들을 가르칩니다", category: "work", statChanges: {intelligence: 1, charm: 1}, stressChange: 3, goldChange: 60, duration: 1, requirements: { intelligence: 50 }, icon: "\u{1F468}\u200D\u{1F3EB}" },
  { id: "rest-sleep", name: "휴식", description: "집에서 푹 쉽니다", category: "rest", statChanges: {}, stressChange: -15, goldChange: 0, duration: 1, icon: "\u{1F634}" },
  { id: "rest-walk", name: "산책", description: "마을을 돌아다닙니다", category: "rest", statChanges: {charm: 1}, stressChange: -8, goldChange: 0, duration: 1, icon: "\u{1F6B6}" },
  { id: "rest-spa", name: "온천", description: "온천에서 피로를 풉니다", category: "rest", statChanges: {charm: 2}, stressChange: -20, goldChange: -30, duration: 1, icon: "\u2668\uFE0F" },
  { id: "social-friend", name: "친구 만나기", description: "친구들과 시간을 보냅니다", category: "social", statChanges: {charm: 2, morality: 1}, stressChange: -5, goldChange: -10, duration: 1, icon: "\u{1F46B}" },
  { id: "social-festival", name: "축제 참가", description: "마을 축제에 참가합니다", category: "social", statChanges: {charm: 2, creativity: 1}, stressChange: -10, goldChange: -20, duration: 1, icon: "\u{1F389}" },
  { id: "combat-training", name: "무술 수련", description: "검술과 무술을 배웁니다", category: "combat", statChanges: {combat: 3, strength: 2}, stressChange: 8, goldChange: -20, duration: 1, icon: "\u2694\uFE0F" },
  { id: "combat-sparring", name: "모의 전투", description: "다른 수련생과 대련합니다", category: "combat", statChanges: {combat: 4, strength: 1}, stressChange: 10, goldChange: 0, duration: 1, requirements: { combat: 20 }, icon: "\u{1F93A}" },
  // dungeon-explore 활동은 스케줄이 아닌 던전선택 화면에서 직접 진입
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


// ────────────────────────────────────────────────────────────────
// 계절 · 연도 한정 상점 아이템
// ────────────────────────────────────────────────────────────────
export interface SeasonalShopEntry {
  season?: "spring" | "summer" | "fall" | "winter"
  year?: number          // 특정 연도부터 판매 (없으면 매년)
  type: "outfit" | "weapon" | "accessory"
  id: string
}

export const SEASONAL_SHOP_ENTRIES: SeasonalShopEntry[] = [
  // 봄 한정
  { season: "spring", type: "outfit",    id: "spring-dress" },
  { season: "spring", type: "accessory", id: "spring-flower-pin" },
  // 여름 한정
  { season: "summer", type: "outfit",    id: "summer-dress" },
  { season: "summer", type: "weapon",    id: "coral-wand" },
  { season: "summer", type: "accessory", id: "summer-shell" },
  // 가을 한정
  { season: "fall",   type: "outfit",    id: "autumn-coat" },
  { season: "fall",   type: "weapon",    id: "autumn-blade" },
  { season: "fall",   type: "accessory", id: "autumn-amber" },
  // 겨울 한정
  { season: "winter", type: "outfit",    id: "winter-coat" },
  { season: "winter", type: "weapon",    id: "frost-lance" },
  { season: "winter", type: "accessory", id: "winter-crystal" },
  // 연도 한정
  { year: 1, type: "accessory", id: "year1-medal" },
  { year: 2, type: "accessory", id: "year2-medal" },
  { year: 3, type: "accessory", id: "year3-medal" },
  { year: 2, type: "outfit",    id: "adventurer-outfit" },
  { year: 3, type: "outfit",    id: "battle-dress" },
  { year: 2, type: "weapon",    id: "silver-hunter-bow" },
  { year: 3, type: "weapon",    id: "ancient-sword" },
]

// Seasonal Events

// ═══════════════════════════════════════════════════════════════════
// NPC 시스템
// ═══════════════════════════════════════════════════════════════════

export interface NPC {
  id: string
  name: string
  icon: string
  role: string
  gender: "female" | "male"
  description: string
  // 조우 조건
  meetCondition: {
    year?: number        // 최소 년차
    month?: number       // 최소 월
    stats?: Partial<Stats>
    morality?: { min?: number; max?: number }  // 도덕 범위 조건
    dungeonCleared?: string  // 특정 던전 클리어
    flag?: string            // 특정 플래그
  }
  // 공략 조건 (호감 올리기 위한 선호)
  preferStats?: Partial<Stats>  // 높을수록 호감 대화 시 보너스
  difficulty: 1 | 2 | 3 | 4 | 5
  // 호감 단계별 대사
  dialogues: {
    first: string      // 첫 만남
    low: string        // 호감 0~29
    mid: string        // 호감 30~59
    high: string       // 호감 60~99
    max: string        // 호감 100
    gift_low: string   // 선물 (낮은 등급)
    gift_high: string  // 선물 (높은 등급)
    daily_limit: string // 오늘은 이미 대화함
  }
  // 전용 장신구 (호감 100 달성 시)
  giftAccessoryId: string
  // 로맨스 전용 조건
  romanceCondition?: {
    morality?: { min?: number; max?: number }
  }
  // 데이트 이벤트 설명
  dateDescription: string
  // 엔딩 연결 (로맨스 엔딩 id)
  romanceEndingId?: string
}

export const NPCS: NPC[] = [
  // ── 여성 NPC ─────────────────────────────────────────────────
  {
    id: "liana",
    name: "리아나",
    icon: "👑",
    role: "왕국의 왕녀 (2학년)",
    gender: "female",
    description: "차갑고 도도한 왕녀. 겉으로는 완벽하지만 내면 깊이 외로움을 품고 있다. 쉽게 마음을 열지 않는다.",
    meetCondition: { year: 2, month: 3, stats: { charm: 40 } },
    preferStats: { charm: 1, faith: 1, morality: 1 },
    difficulty: 5,
    dialogues: {
      first: "...네가 {플레이어}? 소문은 들었어. 하지만 왕녀인 내게 말을 거는 건 상당한 용기가 필요한 일이야.",
      low: "용무가 있으면 말하도록. 나는 바쁜 사람이야.",
      mid: "...최근 네가 눈에 띄더군. 뭔가 다른 구석이 있어.",
      high: "{플레이어}, 솔직히 말할게. 이런 감정은 처음이야. 네 옆에 있으면... 조금 편해.",
      max: "왕녀로서가 아닌 그냥 나로서 말하는 거야. {플레이어}, 나는 네가 좋아.",
      gift_low: "...흠. 성의는 인정하지.",
      gift_high: "이걸... 나를 위해? 고마워. 진심으로.",
      daily_limit: "오늘은 충분히 이야기했어. 내일 보도록.",
    },
    giftAccessoryId: "royal-brooch",
    dateDescription: "왕궁 정원을 단둘이 거닐었다. 리아나는 평소와 달리 조용히 웃어 보였다.",
    romanceEndingId: "romance-liana",
  },
  {
    id: "erika",
    name: "에리카",
    icon: "⚔️",
    role: "아카데미 전투 교관",
    gender: "female",
    description: "냉철하고 엄격한 전투 교관. 실력 없는 자에게는 눈길도 주지 않지만, 진심으로 노력하는 자에게는 달라진다.",
    meetCondition: { year: 2, month: 3 },
    preferStats: { combat: 1, strength: 1, morality: 1 },
    difficulty: 4,
    dialogues: {
      first: "나는 에리카 교관이다. 아카데미에서 전투를 가르친다. 약한 자는 필요 없으니 실망시키지 마라.",
      low: "훈련에는 집중하도록. 잡담은 필요 없어.",
      mid: "...너 꽤 성장했군. 합격이다.",
      high: "{플레이어}. 교관으로서가 아니라 개인적으로 말하는 거야. 넌 내가 만난 제자 중 가장 성실해.",
      max: "이런 말은 처음 하는데... 훈련 이후에 같이 밥이라도 먹을래?",
      gift_low: "훈련 도구도 아닌데... 뭐, 받아두지.",
      gift_high: "이걸 나한테? 교관 체면 때문에 크게 반응은 못 하지만... 감사해.",
      daily_limit: "오늘 할 말은 다 했다. 내일 훈련 보자.",
    },
    giftAccessoryId: "iron-badge",
    dateDescription: "함께 새벽 훈련을 마치고 조용한 식당에서 식사했다. 에리카는 드물게 웃어 보였다.",
    romanceEndingId: "romance-erika",
  },
  {
    id: "sera",
    name: "세라",
    icon: "✨",
    role: "아카데미 동기생 (마법 특기)",
    gender: "female",
    description: "밝고 호기심 넘치는 마법 소녀. 모르는 것을 알아가는 걸 좋아하며 친구를 쉽게 사귄다.",
    meetCondition: { year: 2, month: 3 },
    preferStats: { magic: 1, intelligence: 1 },
    difficulty: 3,
    dialogues: {
      first: "안녕! 나 세라야! 같은 입학생이지? 우리 친해지자! 마법 잘 써?",
      low: "{플레이어}! 오늘도 잘 지냈어? 나 새로운 마법 배웠는데 볼래?",
      mid: "{플레이어}랑 이야기하면 항상 즐거워. 왠지 같이 있으면 마음이 편해.",
      high: "있잖아, {플레이어}... 사실 좋아하는 사람 생겼어. 아직 말 못 하겠지만.",
      max: "{플레이어}한테만 말할게. 사실 그 사람... 너야. 바보같지?",
      gift_low: "어머 선물이야? 고마워! 소중히 할게!",
      gift_high: "이거 정말 비싼 거 아니야?! 너무 좋아!! 진짜 최고야!",
      daily_limit: "오늘은 수업 때문에 바빠. 내일 도서관에서 볼까?",
    },
    giftAccessoryId: "magic-crystal-pin",
    dateDescription: "함께 마법 연구소에서 실험하다가 폭발 사고를 냈다. 그럼에도 둘이 마주 보고 웃었다.",
    romanceEndingId: "romance-sera",
  },
  {
    id: "mina",
    name: "미나",
    icon: "💰",
    role: "상인 딸, 아카데미 동기생",
    gender: "female",
    description: "털털하고 현실적인 상인 집안 딸. 돈과 실용성을 중시하지만 의리 있고 솔직하다.",
    meetCondition: { year: 2, month: 3 },
    preferStats: { charm: 1, creativity: 1 },
    difficulty: 2,
    dialogues: {
      first: "어이! 새 학생? 나는 미나야. 뭐든 필요한 거 있으면 말해. 인맥 넓은 편이거든.",
      low: "요즘 어때? 나는 상점가에서 알바 뛰느라 바빠 죽겠어.",
      mid: "{플레이어}는 진짜 가끔 놀래키더라. 평범한 것 같아도 특별한 구석이 있어.",
      high: "솔직히 말하면... {플레이어} 옆에 있는 게 제일 편해. 이거 고백이라고 받아들여도 되는데.",
      max: "에이, 숨길 필요 없잖아. 나 {플레이어} 좋아해. 거절할 거야?",
      gift_low: "어, 줘서 고마워. 쓸모 있을 것 같아.",
      gift_high: "이거... 꽤 좋은 거잖아. 아, 기분 좋다.",
      daily_limit: "오늘은 가게 도와야 해서. 내일 보자!",
    },
    giftAccessoryId: "coin-charm",
    dateDescription: "상점가를 함께 돌아다니며 흥정을 배웠다. 미나의 활기찬 모습에 마음이 따뜻해졌다.",
    romanceEndingId: "romance-mina",
  },
  // ── 남성 NPC ─────────────────────────────────────────────────
  {
    id: "kairen",
    name: "카이렌",
    icon: "🛡️",
    role: "왕국 기사단 소속 왕자",
    gender: "male",
    description: "정의롭고 완고한 왕자. 기사도를 목숨처럼 여기며 불의와 타협하지 않는다. 도덕적 타락을 경멸한다.",
    meetCondition: { year: 2, month: 3, stats: { morality: 30, combat: 30 } },
    preferStats: { combat: 1, morality: 1, faith: 1 },
    difficulty: 5,
    romanceCondition: { morality: { min: 40 } },
    dialogues: {
      first: "나는 카이렌이다. 기사로서 이 아카데미를 순찰 중이야. 네가 {플레이어}? 눈빛이 좋군.",
      low: "{플레이어}. 기사의 길은 쉽지 않아. 하지만 네겐 그 자질이 보여.",
      mid: "솔직히 말하면... 너와 이야기하는 시간이 하루 중 가장 즐거워.",
      high: "{플레이어}, 기사로서 맹세할게. 너를 지키겠어. 그 이상의 의미도 담아서.",
      max: "왕자로서의 의무와 내 마음 사이에서 고민했어. 하지만 답은 하나야. {플레이어}, 나와 함께해 줄래?",
      gift_low: "성의는 받아들이겠어.",
      gift_high: "이걸... 나를 위해 준비했어? 기사로서 이런 감정은 처음이야.",
      daily_limit: "오늘의 순찰은 끝났어. 내일 훈련장에서 보자.",
    },
    giftAccessoryId: "knight-emblem",
    dateDescription: "기사 훈련장에서 함께 검술을 연마했다. 카이렌은 진지하면서도 따뜻한 눈빛으로 가르쳐줬다.",
    romanceEndingId: "romance-kairen",
  },
  {
    id: "darius",
    name: "다리우스",
    icon: "🌑",
    role: "어둠의 거래상",
    gender: "male",
    description: "정체불명의 거래상. 겉으로는 평범한 상인이지만 비밀스러운 거래를 한다. 어둠 속에서 모습을 드러낸다.",
    meetCondition: { year: 1, month: 6, morality: { max: 20 } },
    preferStats: { magic: 1, intelligence: 1 },
    difficulty: 4,
    romanceCondition: { morality: { max: -10 } },
    dialogues: {
      first: "...재미있는 눈빛이군. 어둠을 두려워하지 않는 자, 내가 찾던 사람이야. 나는 다리우스.",
      low: "거래는 항상 이익을 따져야 해. 감정 따위에 휘둘리지 말고.",
      mid: "{플레이어}, 넌 나와 비슷해. 세상의 밝은 면만 보는 척하는 바보들과 달리.",
      high: "이런 감정은 거래에 방해가 되는데... 네 앞에선 계산이 안 돼.",
      max: "어둠 속에서 오래 살았어. 따뜻한 게 뭔지 잊었는데... {플레이어}, 넌 나를 바꿔.",
      gift_low: "흥미롭군. 가져가지.",
      gift_high: "이런... 취향을 알아? 마음에 들어.",
      daily_limit: "오늘 거래는 끝났어. 다음에 보자.",
    },
    giftAccessoryId: "shadow-pendant",
    dateDescription: "밤의 뒷골목을 함께 걸었다. 다리우스는 드물게 진심 어린 이야기를 털어놓았다.",
    romanceEndingId: "romance-darius",
  },
  {
    id: "leon",
    name: "레온",
    icon: "🌹",
    role: "귀족 출신 동기생",
    gender: "male",
    description: "느긋하고 여유있는 귀족 남자. 겉보기엔 게으른 것 같지만 예술과 음악에 대한 깊은 조예를 가졌다.",
    meetCondition: { year: 2, month: 3 },
    preferStats: { charm: 1, creativity: 1 },
    difficulty: 3,
    dialogues: {
      first: "오, 새 학생이군. 나는 레온이야. 뭐... 딱히 기대는 안 했는데, 네 눈빛이 흥미롭네.",
      low: "어, {플레이어}? 오늘도 열심히 하는군. 나는 그냥 나무 아래서 쉬려고.",
      mid: "{플레이어}랑 이야기하면 심심하지가 않아. 이거 드물거든, 나한테.",
      high: "사실 너한테만 보여주고 싶은 게 있어. 내가 작곡한 거야. 들어볼래?",
      max: "{플레이어}... 솔직히 말할게. 이 음악, 처음부터 끝까지 네 생각 하면서 만들었어.",
      gift_low: "어, 고마워. 나쁘지 않은데.",
      gift_high: "오... 이거 꽤 좋은 안목이잖아. 마음에 들어.",
      daily_limit: "오늘은 낮잠 자야 해. 내일 연주 들려줄게.",
    },
    giftAccessoryId: "rose-brooch",
    dateDescription: "레온이 연주하는 음악을 들으며 정원에서 조용한 시간을 보냈다.",
    romanceEndingId: "romance-leon",
  },
  {
    id: "tom",
    name: "톰",
    icon: "💪",
    role: "평민 출신 동기생",
    gender: "male",
    description: "열정적이고 순수한 평민 출신 소년. 가난하지만 꿈을 향해 달리는 에너지가 넘친다.",
    meetCondition: { year: 2, month: 3 },
    preferStats: { strength: 1, morality: 1 },
    difficulty: 2,
    dialogues: {
      first: "야, 안녕! 나 톰이야! 아카데미 합격했어! 믿겨져?! 너도 새 학생이야?",
      low: "{플레이어}! 오늘 훈련 엄청 힘들었다. 근데 포기 안 했어! 파이팅!",
      mid: "있잖아, {플레이어}. 나 힘들 때 네가 옆에 있어줘서 진짜 힘이 됐어.",
      high: "{플레이어}... 내가 평민이라서 이런 말 하기 어려운데. 그래도 말하고 싶어.",
      max: "나 {플레이어} 좋아해! 귀족이든 평민이든 상관없잖아! 같이 해줄래?!",
      gift_low: "어, 고마워! 소중히 쓸게!",
      gift_high: "이게 얼마짜린지 알아?! 받아도 돼?! 진짜 고마워!!",
      daily_limit: "오늘 훈련 때문에 지쳐버렸어. 내일 또 보자!",
    },
    giftAccessoryId: "friendship-band",
    dateDescription: "함께 마을 구석구석을 뛰어다니며 오래된 비밀 장소를 발견했다.",
    romanceEndingId: "romance-tom",
  },
]

// NPC 전용 장신구 데이터 (ACCESSORIES에 추가할 것들)
export const NPC_ACCESSORIES = [
  { id: "royal-brooch",       name: "왕녀의 브로치",     icon: "👑", rarity: "legendary" as const, obtainMethod: "리아나 호감 100", description: "리아나가 건넨 왕가의 브로치. 따뜻함이 깃들어 있다.", effect: { charm: 8, magicBonus: 10, critChance: 0.06 } },
  { id: "iron-badge",         name: "에리카의 기사 휘장", icon: "⚔️", rarity: "rare" as const,     obtainMethod: "에리카 호감 100", description: "에리카 교관이 직접 달아준 기사 훈련 휘장.", effect: { attackBonus: 15, defenseBonus: 8 } },
  { id: "magic-crystal-pin",  name: "세라의 마법 핀",    icon: "✨", rarity: "rare" as const,     obtainMethod: "세라 호감 100",  description: "세라가 마법을 담아 만든 작은 핀.", effect: { magicBonus: 12, xpBonus: 0.15 } },
  { id: "coin-charm",         name: "미나의 행운 코인",  icon: "🪙", rarity: "uncommon" as const, obtainMethod: "미나 호감 100",  description: "미나가 건넨 행운의 동전 펜던트.", effect: { goldMultiplier: 0.2, hpBonus: 20 } },
  { id: "knight-emblem",      name: "카이렌의 기사단 문장",icon: "🛡️",rarity: "legendary" as const, obtainMethod: "카이렌 호감 100",description: "카이렌이 직접 떼어준 기사단 문장.", effect: { attackBonus: 12, defenseBonus: 10, critChance: 0.07 } },
  { id: "shadow-pendant",     name: "다리우스의 그림자 펜던트",icon: "🌑",rarity: "legendary" as const,obtainMethod: "다리우스 호감 100",description: "다리우스가 건넨 정체불명의 펜던트. 어둠의 힘이 깃들어 있다.", effect: { attackBonus: 18, magicBonus: 18, critChance: 0.10 } },
  { id: "rose-brooch",        name: "레온의 장미 브로치", icon: "🌹", rarity: "rare" as const,     obtainMethod: "레온 호감 100",  description: "레온이 작곡한 음악처럼 우아한 브로치.", effect: { magicBonus: 8, xpBonus: 0.12, goldMultiplier: 0.1 } },
  { id: "friendship-band",    name: "톰의 우정 팔찌",    icon: "💪", rarity: "uncommon" as const, obtainMethod: "톰 호감 100",    description: "톰이 직접 만든 가죽 팔찌. 온기가 느껴진다.", effect: { hpBonus: 35, attackBonus: 6 } },
]

// 선물 등급 정의
export const GIFT_GRADES = {
  low:    { label: "일반 선물",   affectionGain: 5,  items: ["stress-tea", "healing-potion", "art-supplies"] },
  mid:    { label: "고급 선물",   affectionGain: 15, items: ["magic-book", "charm-necklace", "wisdom-pendant"] },
  high:   { label: "희귀 선물",   affectionGain: 30, items: ["holy-water", "combat-manual", "recipe-book"] },
}

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: "spring-flower-festival", season: "spring", title: "꽃축제",
    description: "마을 광장에서 성대한 꽃축제가 열립니다. 알록달록한 꽃들이 가득하고, 다양한 행사가 진행됩니다.",
    choices: [
      { text: "꽃꽂이 대회에 참가한다", requirements: { creativity: 100 }, outcomes: { description: "아름다운 꽃꽂이로 대상을 수상했습니다! 꽃의 여왕 드레스를 상으로 받았습니다!", statChanges: { creativity: 4, charm: 2 }, goldChange: 80, outfitReward: "flower-crown" } },
      { text: "꽃을 선물 받는다", outcomes: { description: "누군가가 예쁜 꽃다발을 선물해 주었습니다. 마음이 따뜻해집니다.", statChanges: { charm: 2 }, stressChange: -10 } },
      { text: "신비로운 꽃을 발견한다", requirements: { magic: 100 }, outcomes: { description: "마법이 깃든 희귀한 꽃을 발견했습니다. 이 꽃은 고대의 비밀과 연결되어 있습니다...", statChanges: { magic: 3 }, worldKnowledgeChange: 5 } },
    ],
  },
  {
    id: "spring-planting", season: "spring", title: "파종의 계절",
    description: "농부들이 씨앗을 뿌리는 계절입니다. 마을에서 함께 농사를 돕자는 요청이 왔습니다.",
    choices: [
      { text: "열심히 농사를 돕는다", outcomes: { description: "땀 흘려 일한 대가로 보상을 받았습니다. 성실함을 인정받았습니다!", statChanges: { strength: 2, morality: 2 }, goldChange: 50, stressChange: 5 } },
      { text: "아이들에게 식물 키우기를 가르친다", requirements: { intelligence: 100 }, outcomes: { description: "아이들이 즐거워합니다. 가르치는 보람을 느꼈습니다.", statChanges: { intelligence: 2, charm: 2, morality: 2 } } },
    ],
  },
  {
    id: "summer-beach", season: "summer", title: "바다 축제",
    description: "무더운 여름, 해변에서 축제가 열립니다. 시원한 바닷바람이 불어옵니다.",
    choices: [
      { text: "수영 대회에 참가한다", requirements: { strength: 110 }, outcomes: { description: "멋진 수영 실력으로 우승했습니다! 해변 원피스를 상으로 받았습니다!", statChanges: { strength: 3, combat: 1 }, goldChange: 60, outfitReward: "swimsuit" } },
      { text: "모래성 짓기 대회에 참가한다", outcomes: { description: "창의적인 모래성을 만들었습니다. 즐거운 시간이었어요!", statChanges: { creativity: 3 }, stressChange: -15 } },
      { text: "해변에서 이상한 조개를 발견한다", requirements: { magic: 75 }, outcomes: { description: "조개 속에서 고대 바다 신의 메시지가 담긴 진주를 발견했습니다...", statChanges: { magic: 2, faith: 2 }, worldKnowledgeChange: 8 } },
    ],
  },
  {
    id: "summer-ghost", season: "summer", title: "백중 귀신 이야기",
    description: "여름밤, 마을 사람들이 모여 귀신 이야기를 나눕니다. 등골이 서늘해집니다.",
    choices: [
      { text: "무서운 이야기를 들려준다", requirements: { charm: 90 }, outcomes: { description: "당신의 이야기에 모두가 소름 돋았습니다! 이야기꾼으로 유명해졌어요.", statChanges: { charm: 3, creativity: 2 } } },
      { text: "진짜 귀신을 찾아 나선다", requirements: { combat: 75, faith: 75 }, outcomes: { description: "숲에서 떠도는 영혼을 만났습니다. 그 영혼은 세계의 비밀 일부를 알려주었습니다...", statChanges: { faith: 4, magic: 2 }, worldKnowledgeChange: 10, stressChange: 10 } },
      { text: "무서워서 집에 간다", outcomes: { description: "푹 자고 일어났습니다. 때로는 쉬는 것도 중요하죠.", stressChange: -10 } },
    ],
  },
  {
    id: "fall-harvest", season: "fall", title: "수확제",
    description: "풍성한 수확을 축하하는 축제입니다. 마을 전체가 기쁨에 넘칩니다.",
    choices: [
      { text: "요리 대회에 참가한다", requirements: { cooking: 125 }, outcomes: { description: "맛있는 요리로 대상을 수상했습니다! 요리사 복장을 상으로 받았습니다!", statChanges: { cooking: 4, charm: 2 }, goldChange: 100, outfitReward: "chef" } },
      { text: "추수를 돕는다", outcomes: { description: "열심히 일한 덕분에 보상을 받았습니다. 몸이 건강해진 기분이에요.", statChanges: { strength: 2, housework: 2 }, goldChange: 70 } },
      { text: "고대 수확 의식에 참여한다", requirements: { faith: 125 }, outcomes: { description: "오래된 의식을 통해 대지의 정령과 교감했습니다. 이 세계의 순환에 대해 깊이 이해하게 되었습니다.", statChanges: { faith: 5, magic: 3 }, worldKnowledgeChange: 12 } },
    ],
  },
  {
    id: "fall-moon", season: "fall", title: "보름달 밤",
    description: "크고 밝은 보름달이 떴습니다. 달빛이 세상을 신비롭게 물들입니다.",
    choices: [
      { text: "달을 보며 시를 짓는다", requirements: { creativity: 90 }, outcomes: { description: "아름다운 시가 완성되었습니다. 영감이 샘솟습니다.", statChanges: { creativity: 4, charm: 2 } } },
      { text: "달빛 아래 명상한다", outcomes: { description: "마음이 평온해졌습니다. 내면의 힘이 강해진 것 같아요.", stressChange: -20, statChanges: { faith: 2 } } },
      { text: "달의 마법을 연구한다", requirements: { magic: 125, intelligence: 125 }, outcomes: { description: "달은 단순한 천체가 아닙니다. 고대 여신이 남긴 마법의 거울이며, 세계의 비밀을 비추고 있습니다...", statChanges: { magic: 5, intelligence: 3 }, worldKnowledgeChange: 15 } },
    ],
  },
  {
    id: "winter-snow", season: "winter", title: "첫눈",
    description: "하얀 눈이 세상을 덮었습니다. 아이들이 밖으로 뛰어나갑니다.",
    choices: [
      { text: "눈싸움을 한다", outcomes: { description: "신나게 눈싸움을 했습니다! 친구들과 더 가까워졌어요.", statChanges: { combat: 1, strength: 1 }, stressChange: -15 } },
      { text: "눈사람을 만든다", outcomes: { description: "예쁜 눈사람이 완성되었습니다. 창작의 기쁨을 느꼈어요.", statChanges: { creativity: 2 }, stressChange: -10 } },
      { text: "눈 속에서 빛나는 것을 발견한다", requirements: { magic: 90 }, outcomes: { description: "얼어붙은 요정의 눈물을 발견했습니다. 그 안에 고대의 기억이 담겨 있었습니다...", statChanges: { magic: 3 }, worldKnowledgeChange: 7 } },
    ],
  },
  {
    id: "winter-solstice", season: "winter", title: "동지 축제",
    description: "가장 긴 밤, 사람들이 모여 빛의 귀환을 축하합니다. 신성한 기운이 감돕니다.",
    choices: [
      { text: "성가대에서 노래한다", requirements: { charm: 100 }, outcomes: { description: "아름다운 노래로 모두를 감동시켰습니다. 감사의 선물을 받았어요.", statChanges: { charm: 3, faith: 3 }, goldChange: 50 } },
      { text: "가난한 이웃을 돕는다", outcomes: { description: "따뜻한 마음을 나누었습니다. 진정한 행복을 느꼈어요.", statChanges: { morality: 4, faith: 2 }, goldChange: -30 } },
      { text: "고대 동지 의식에 참여한다", requirements: { faith: 150, magic: 150 }, outcomes: { description: "어둠과 빛의 균형 속에서 세계의 진정한 모습을 보았습니다. 신녀 복장을 하사받았습니다!", statChanges: { faith: 5, magic: 5 }, worldKnowledgeChange: 20, outfitReward: "priestess" } },
    ],
  },

  // ── 아카데미 이벤트 ──────────────────────────────────────────
  {
    id: "academy-entrance", season: "spring", minYear: 2, maxYear: 2,
    title: "🏫 아카데미 입학식",
    description: "2년차 봄, 왕립 아카데미 입학식이 열렸다. 화려한 홀에 수많은 신입생들이 모였다. 어떻게 입학식에 임할 것인가?",
    choices: [
      { text: "당당하게 앞줄에 선다", requirements: { charm: 75 },
        outcomes: { description: "눈에 띄는 등장으로 많은 학생들의 시선을 끌었다. 교장 선생님이 칭찬을 건넸다.", statChanges: { charm: 3, morality: 1 } } },
      { text: "조용히 자리를 지킨다",
        outcomes: { description: "차분하게 식을 지켜보며 아카데미를 관찰했다. 여러 학생들의 얼굴을 기억했다.", statChanges: { intelligence: 2 } } },
      { text: "소란을 일으켜 주목받는다",
        outcomes: { description: "의도치 않은 소동으로 교관에게 첫날부터 경고를 받았다. 하지만 유명해졌다.", statChanges: { charm: 2, morality: -3 } } },
    ]
  },
  {
    id: "academy-midterm", season: "summer", minYear: 2,
    title: "📝 아카데미 중간 시험",
    description: "여름, 아카데미 중간 시험이 다가왔다. 전투, 마법, 학문 세 과목으로 구성된 종합 시험이다.",
    choices: [
      { text: "열심히 준비해서 전 과목 응시", requirements: { intelligence: 100, combat: 75 },
        outcomes: { description: "모든 과목에서 우수한 성적을 거뒀다! 교관들이 극찬을 아끼지 않았다.", statChanges: { intelligence: 3, combat: 2, charm: 2 }, goldChange: 100 } },
      { text: "잘 아는 과목만 응시",
        outcomes: { description: "선택한 과목에서 좋은 결과를 얻었다. 집중 학습의 효과가 나타났다.", statChanges: { intelligence: 4 } } },
      { text: "커닝을 시도한다",
        outcomes: { description: "들키지는 않았지만 마음이 불편하다. 성적은 나왔지만 찜찜하다.", statChanges: { intelligence: 1, morality: -5 }, goldChange: 50 } },
    ]
  },
  {
    id: "academy-ball", season: "fall", minYear: 2,
    title: "🎭 아카데미 가을 무도회",
    description: "가을, 아카데미 전통 무도회가 열렸다. 드레스와 예복이 가득한 화려한 밤. 파트너를 구해야 한다.",
    choices: [
      { text: "호감도 높은 NPC에게 신청한다", requirements: { charm: 125 },
        outcomes: { description: "아름다운 밤을 함께했다. 춤을 추며 서로의 마음을 확인한 것 같다.", statChanges: { charm: 4, morality: 2 }, outfitReward: "party-dress" } },
      { text: "혼자 우아하게 즐긴다",
        outcomes: { description: "혼자지만 당당하게 무도회를 즐겼다. 매력이 빛을 발했다.", statChanges: { charm: 3 } } },
      { text: "무도회 뒤편에서 정보를 모은다", requirements: { intelligence: 90 },
        outcomes: { description: "각종 귀족들의 대화를 엿들으며 유용한 정보를 수집했다.", statChanges: { intelligence: 3 }, goldChange: 80 } },
    ]
  },
  {
    id: "academy-finals", season: "winter", minYear: 2,
    title: "🎓 아카데미 기말 시험 및 시상식",
    description: "겨울, 학기 마지막 시험과 시상식이 열렸다. 이 해의 마무리를 어떻게 할 것인가?",
    choices: [
      { text: "전력을 다해 최우수상을 노린다", requirements: { intelligence: 125, combat: 100 },
        outcomes: { description: "최우수 학생으로 선정되었다! 트로피와 함께 장학금을 받았다.", statChanges: { intelligence: 4, charm: 3 }, goldChange: 200 } },
      { text: "적당히 마무리한다",
        outcomes: { description: "무난하게 학기를 마쳤다. 그래도 한 해 동안 많이 성장했다.", statChanges: { intelligence: 2 } } },
      { text: "시상식에서 라이벌과 대결한다",
        outcomes: { description: "예상치 못한 대결로 화제가 됐다. 결과는 무승부, 하지만 강렬한 인상을 남겼다.", statChanges: { combat: 3, charm: 2 } } },
    ]
  },
  // ── 도덕 분기 이벤트 ──────────────────────────────────────────
  {
    id: "dark-merchant-visit", season: "summer",
    title: "🌑 수상한 방문자",
    description: "늦은 밤, 수상한 남자가 접근했다. '좋은 거래를 제안하지. 금지된 마법서... 관심 있어?'",
    choices: [
      { text: "거절한다",
        outcomes: { description: "당당하게 거절했다. 남자는 쓴웃음을 짓고 사라졌다.", statChanges: { morality: 3 } } },
      { text: "내용을 듣기만 한다",
        outcomes: { description: "호기심에 이야기를 들었다. 내용이 상당히 구미가 당긴다...", statChanges: { intelligence: 1, morality: -2 } } },
      { text: "거래에 응한다",
        outcomes: { description: "금지된 마법서를 손에 넣었다. 강력하지만... 올바른 선택이었을까?", statChanges: { magic: 5, morality: -10 }, goldChange: -150 } },
    ]
  },
  {
    id: "morality-test-help", season: "spring",
    title: "🤝 골목의 위기",
    description: "골목에서 불량배에게 괴롭힘 당하는 아이를 발견했다. 어떻게 할 것인가?",
    choices: [
      { text: "직접 나서서 구해준다", requirements: { combat: 50 },
        outcomes: { description: "불량배를 쫓아내고 아이를 구했다. 아이의 감사 인사가 마음을 따뜻하게 한다.", statChanges: { morality: 5, combat: 1 } } },
      { text: "관리인에게 신고한다",
        outcomes: { description: "어른에게 신고해 상황을 해결했다. 현명한 판단이었다.", statChanges: { morality: 3, intelligence: 1 } } },
      { text: "무시하고 지나간다",
        outcomes: { description: "모른 척하고 지나쳤다. 마음 한구석이 불편하다.", statChanges: { morality: -5 } } },
      { text: "불량배와 함께 협박한다",
        outcomes: { description: "아이에게서 용돈을 뜯었다. 분명히 잘못된 일이지만...", statChanges: { morality: -15 }, goldChange: 30 } },
    ]
  },
  {
    id: "royal-corruption", season: "fall",
    title: "🎭 왕실의 비밀",
    description: "우연히 왕실 귀족의 부정부패 현장을 목격했다. 증거를 손에 넣었다. 어떻게 처리할 것인가?",
    choices: [
      { text: "당국에 신고한다", requirements: { morality: 50 },
        outcomes: { description: "정의를 선택했다. 귀족은 처벌받고, {플레이어}의 이름이 왕국에 알려졌다.", statChanges: { morality: 10, charm: 3 } } },
      { text: "증거를 팔아 이득을 취한다",
        outcomes: { description: "귀족에게 거액을 받고 증거를 팔았다. 도덕적으로는 문제지만 실리를 챙겼다.", statChanges: { morality: -12 }, goldChange: 500 } },
      { text: "협박 카드로 활용한다",
        outcomes: { description: "정보를 활용해 지속적인 이익을 챙기기로 했다. 위험한 게임의 시작이다.", statChanges: { morality: -20, intelligence: 2 }, goldChange: 200 } },
    ]
  },
]

// Dungeon Enemies (per dungeon)
export const DUNGEON_ENEMIES: DungeonEnemy[] = [
  // ── 변방의 숲 ──────────────────────────────────────────
  { id: "slime",          name: "슬라임",       icon: "🟢", hp: 160,  attack: 24,  defense: 6,  magicResist: 6,  goldReward: 10, expReward: { combat: 1 }, xp: 8,       dungeonId: "forest",   materialDrop: "slime-gel",     floorRange: [1,10] },
  { id: "goblin",         name: "고블린",       icon: "👺", hp: 220,  attack: 36, defense: 10,  magicResist: 6,  goldReward: 18, expReward: { combat: 1, strength: 1 }, xp: 12, dungeonId: "forest",   materialDrop: "goblin-ear",    floorRange: [1,15] },
  { id: "wolf",           name: "숲늑대",       icon: "🐺", hp: 260,  attack: 48, defense: 8,  magicResist: 4,  goldReward: 22, expReward: { combat: 2 }, xp: 18,      dungeonId: "forest",   materialDrop: "wolf-fang",     floorRange: [5,18] },
  { id: "skeleton",       name: "해골 병사",    icon: "💀", hp: 300,  attack: 54, defense: 18,  magicResist: 8,  goldReward: 20, expReward: { combat: 2 }, xp: 22,      dungeonId: "forest",   materialDrop: "skeleton-bone", floorRange: [10,19] },
  { id: "boss-forest",    name: "숲의 수호자",  icon: "🐉", hp: 1000, attack: 84, defense: 40, magicResist: 30, goldReward: 100, expReward: { combat: 8, strength: 4 }, xp: 120, dungeonId: "forest",   materialDrop: "dragon-scale",  floorRange: [20,20], isBoss: true },
  // ── 설원 골짜기 ───────────────────────────────────────
  { id: "frost-wolf",     name: "서리늑대",     icon: "🐺", hp: 360,  attack: 66, defense: 10,  magicResist: 8, goldReward: 25, expReward: { combat: 2, strength: 1 }, xp: 28, dungeonId: "valley",   materialDrop: "frost-crystal", floorRange: [1,15] },
  { id: "ice-troll",      name: "빙결 트롤",    icon: "🧟", hp: 560, attack: 84, defense: 20, magicResist: 12,  goldReward: 40, expReward: { combat: 3, strength: 2 }, xp: 40, dungeonId: "valley",   materialDrop: "troll-hide",    floorRange: [5,19] },
  { id: "orc",            name: "오크 전사",    icon: "👹", hp: 440, attack: 75, defense: 16, magicResist: 10,  goldReward: 30, expReward: { combat: 3 }, xp: 35,      dungeonId: "valley",   materialDrop: "orc-tusk",      floorRange: [8,19] },
  { id: "boss-valley",    name: "빙룡",         icon: "❄️", hp: 1750, attack: 126, defense: 60, magicResist: 40, goldReward: 200, expReward: { combat: 10, magic: 5 }, xp: 200, dungeonId: "valley",   materialDrop: "frost-core",    floorRange: [20,20], isBoss: true },
  // ── 핏빛 성채 ──────────────────────────────────────────
  { id: "fortress-wraith",name: "성채 망령",    icon: "👻", hp: 400, attack: 105, defense: 15,  magicResist: 25, goldReward: 40, expReward: { magic: 3, faith: 2 }, xp: 45, dungeonId: "fortress", materialDrop: "wraith-essence",floorRange: [1,15] },
  { id: "dark-knight",    name: "암흑 기사",    icon: "🖤", hp: 640, attack: 120, defense: 30, magicResist: 15, goldReward: 50, expReward: { combat: 4, strength: 2 }, xp: 55, dungeonId: "fortress", floorRange: [5,19] },
  { id: "gargoyle",       name: "가고일",       icon: "🗿", hp: 520, attack: 96, defense: 20, magicResist: 12, goldReward: 40, expReward: { combat: 3, strength: 2 }, xp: 50, dungeonId: "fortress", floorRange: [8,19] },
  { id: "boss-fortress",  name: "성채의 군주",  icon: "♦️", hp: 2750, attack: 165, defense: 60, magicResist: 35, goldReward: 300, expReward: { combat: 12, strength: 5 }, xp: 300, dungeonId: "fortress", materialDrop: "blood-ruby",    floorRange: [20,20], isBoss: true },
  // ── 검은 세계수 ───────────────────────────────────────
  { id: "dark-treant",    name: "암흑 나무정령",icon: "🌑", hp: 720, attack: 135, defense: 25, magicResist: 18, goldReward: 60, expReward: { combat: 4, magic: 3 }, xp: 65, dungeonId: "worldtree",materialDrop: "dark-sap",      floorRange: [1,15] },
  { id: "fallen-angel",   name: "타락 천사",    icon: "😇", hp: 800, attack: 165, defense: 30, magicResist: 25, goldReward: 70, expReward: { faith: 4, magic: 4 }, xp: 75, dungeonId: "worldtree",floorRange: [8,19] },
  { id: "boss-worldtree", name: "세계수의 어둠",icon: "🌿", hp: 3750, attack: 195, defense: 70, magicResist: 50, goldReward: 400, expReward: { combat: 12, magic: 8 }, xp: 400, dungeonId: "worldtree",materialDrop: "world-root",    floorRange: [20,20], isBoss: true },
  // ── 세계의 끝 ──────────────────────────────────────────
  { id: "seraph-guardian",name: "세라핌 수호자",icon: "🌟", hp: 880, attack: 180, defense: 50, magicResist: 90, goldReward: 130, expReward: { faith: 5, magic: 4 }, xp: 90, dungeonId: "worldsend",materialDrop: "divine-feather",floorRange: [1,29] },
  { id: "boss-worldsend", name: "여신의 그림자",icon: "✨", hp: 4500, attack: 216, defense: 80, magicResist: 90, goldReward: 900, expReward: { faith: 12, magic: 10, intelligence: 8 }, xp: 550, dungeonId: "worldsend", materialDrop: "goddess-tear", floorRange: [30,30], isBoss: true },
  // ── 무저갱 ────────────────────────────────────────────
  { id: "void-shade",     name: "공허의 그림자",icon: "⬛", hp: 1000, attack: 195, defense: 35, magicResist: 40, goldReward: 100, expReward: { combat: 5, magic: 5 }, xp: 100, dungeonId: "abyss",    materialDrop: "void-shard",    floorRange: [1,90] },
  { id: "abyss-demon",    name: "심연의 악마",  icon: "😈", hp: 1200, attack: 225, defense: 40, magicResist: 50, goldReward: 120, expReward: { combat: 6, strength: 4 }, xp: 120, dungeonId: "abyss",    floorRange: [10,90] },
  { id: "boss-abyss",     name: "마왕의 현신",  icon: "🕳️", hp: 6000, attack: 255,  defense: 90, magicResist: 70, goldReward: 600, expReward: { combat: 20, magic: 15, faith: 10 }, xp: 999, dungeonId: "abyss", materialDrop: "abyss-core", floorRange: [99,99], isBoss: true },

  // ── 특수 스토리 적 ──────────────────────────────────────────────
  { id: "goddess-combat",    name: "여신",           icon: "☀️",  hp: 999999, attack: 999, defense: 999, magicResist: 999, goldReward: 0, expReward: {}, xp: 0,
    dungeonId: "worldsend", floorRange: [30,30], isBoss: true,
    description: "거역할 수 없는 절대적 존재. 모든 공격이 빗나간다..." },
  { id: "demon-king",        name: "마왕",           icon: "👿",  hp: 8000,  attack: 150, defense: 80,  magicResist: 70,  goldReward: 2000, expReward: { combat: 30, magic: 20, strength: 15 }, xp: 5000,
    dungeonId: "abyss",     floorRange: [50,50], isBoss: true, materialDrop: "abyss-core",
    description: "세상을 지배하는 어둠의 왕. 극한의 전투력을 가졌다." },
]

// Dungeon Encounters — 공통 3개 + 던전별 테마 이벤트 2개씩
export const DUNGEON_ENCOUNTERS: DungeonEncounter[] = [
  // ── 공통 이벤트 ───────────────────────────────────────────────────────────
  { id: "treasure", type: "treasure", title: "보물 상자", description: "먼지 쌓인 보물 상자가 눈앞에 있다.", icon: "📦", floorRange: [1,99],
    choices: [
      { text: "열어본다", outcomes: { description: "금화가 쏟아져 나왔다!", goldChange: 60, nextFloor: true } },
      { text: "조심히 열어본다", requirements: { intelligence: 40 }, outcomes: { description: "함정을 피해 더 많이 챙겼다!", goldChange: 120, nextFloor: true } },
    ]},
  { id: "healing-spring", type: "rest", title: "치유의 샘", description: "맑은 샘이 솟아오른다. 마시면 기력이 회복될 것 같다.", icon: "⛲", floorRange: [1,99],
    choices: [
      { text: "물을 마신다", outcomes: { description: "상처가 아물었다.", healthChange: 40, nextFloor: true } },
      { text: "깊이 명상한다", outcomes: { description: "몸과 마음이 회복됐다.", healthChange: 25, statChanges: { faith: 1 }, nextFloor: true } },
    ]},
  { id: "merchant", type: "merchant", title: "떠돌이 상인", description: "어둠 속에서 상인 하나가 나타났다. '물건 좀 보시게나!'", icon: "🧔", floorRange: [1,95],
    choices: [
      { text: "치유 물약 (-30G)", outcomes: { description: "물약을 구매했다.", goldChange: -30, healthChange: 50, nextFloor: true } },
      { text: "그냥 지나간다", outcomes: { description: "...", nextFloor: true } },
    ]},

  // ── 변방의 숲 전용 ────────────────────────────────────────────────────────
  { id: "forest-fairy", type: "fairy", title: "길 잃은 요정", description: "작고 파란 빛의 요정이 눈물을 흘리고 있다. '길을 잃었어... 도와줘.'", icon: "🧚", floorRange: [1,29],
    choices: [
      { text: "길을 안내해준다", outcomes: { description: "'고마워! 선물이야.' 요정이 작은 빛을 남기고 사라진다. HP가 회복됐다!", healthChange: 30, statChanges: { charm: 1 }, nextFloor: true } },
      { text: "요정 언어로 말을 건다", requirements: { magic: 25 }, outcomes: { description: "요정이 기뻐하며 마법을 가르쳐준다!", statChanges: { magic: 3 }, nextFloor: true } },
      { text: "무시하고 지나간다", outcomes: { description: "요정의 슬픈 눈빛이 마음에 걸린다.", nextFloor: true } },
    ]},
  { id: "forest-hunter", type: "secret", title: "노련한 사냥꾼", description: "수풀 속에 숨어있던 사냥꾼이 나타났다. '이 숲을 혼자 다니다니 배짱 하나는 좋군.'", icon: "🏹", floorRange: [3,20],
    choices: [
      { text: "함께 사냥하자고 제안한다", requirements: { strength: 20 }, outcomes: { description: "함께 사냥해서 전리품을 나눴다!", goldChange: 80, statChanges: { strength: 2 }, nextFloor: true } },
      { text: "숲의 비밀을 묻는다", requirements: { intelligence: 20 }, outcomes: { description: "사냥꾼이 숲 깊은 곳의 보물을 알려줬다!", goldChange: 50, nextFloor: true } },
      { text: "인사만 하고 지나간다", outcomes: { description: "사냥꾼이 고개를 끄덕인다.", nextFloor: true } },
    ]},

  // ── 설원 골짜기 전용 ──────────────────────────────────────────────────────
  { id: "valley-survivor", type: "secret", title: "조난자", description: "눈보라 속에서 반쯤 얼어붙은 탐험가를 발견했다. '제발... 살려줘...'", icon: "🧊", floorRange: [1,29],
    choices: [
      { text: "불을 피워 데워준다", outcomes: { description: "탐험가가 회복하며 감사의 표시로 지도를 줬다! 앞길이 쉬워진다.", goldChange: 60, nextFloor: true } },
      { text: "가진 물약을 준다", requirements: { faith: 20 }, outcomes: { description: "탐험가가 살아났다. '평생 은인을 잊지 않겠소!' 축복을 받았다.", statChanges: { morality: 2, faith: 1 }, nextFloor: true } },
      { text: "그냥 지나간다", outcomes: { description: "마음이 무겁다. 도덕심이 흔들린다.", statChanges: { morality: -2 }, nextFloor: true } },
    ]},
  { id: "valley-ice-spirit", type: "fairy", title: "빙령(氷靈)", description: "투명한 얼음 정령이 길을 막는다. '이 추위를 견뎌낸 자만이 나를 지나갈 수 있다.'", icon: "❄️", floorRange: [5,20],
    choices: [
      { text: "힘으로 밀고 나아간다", requirements: { strength: 30 }, outcomes: { description: "정령이 물러선다. '강하구나.' 길이 열린다.", statChanges: { strength: 2 }, nextFloor: true } },
      { text: "추위를 노래로 달랜다", requirements: { creativity: 25 }, outcomes: { description: "정령이 감동받아 얼음 결정을 선물한다!", goldChange: 100, nextFloor: true } },
      { text: "퍼져있는 약점을 찾는다", requirements: { intelligence: 35 }, outcomes: { description: "빙령의 핵심에 마법을 집중시켰다! 더 쉽게 길을 열었다.", statChanges: { magic: 2 }, nextFloor: true } },
    ]},

  // ── 핏빛 성채 전용 ────────────────────────────────────────────────────────
  { id: "fortress-prisoner", type: "secret", title: "지하 감옥", description: "낡은 감옥 안에 한 여인이 갇혀있다. '구해주세요... 마왕의 부하들이...'", icon: "⛓️", floorRange: [1,29],
    choices: [
      { text: "잠금장치를 부순다", requirements: { strength: 40 }, outcomes: { description: "여인을 구해냈다! '이 열쇠가 도움이 될 거예요.' 황금 열쇠를 받았다!", goldChange: 150, nextFloor: true } },
      { text: "자물쇠를 해제한다", requirements: { intelligence: 45 }, outcomes: { description: "교묘히 자물쇠를 따서 구해냈다. 여인이 비밀통로를 알려준다!", statChanges: { combat: 2 }, nextFloor: true } },
      { text: "위험해서 그냥 간다", outcomes: { description: "여인의 울음소리가 멀어진다.", statChanges: { morality: -3 }, nextFloor: true } },
    ]},
  { id: "fortress-ghost", type: "fairy", title: "성채의 원혼", description: "갑옷을 입은 유령이 나타났다. '나는... 이 성을 지키다 죽었소. 당신은 무엇을 위해 싸우오?'", icon: "👻", floorRange: [5,20],
    choices: [
      { text: "'정의를 위해 싸웁니다'", requirements: { morality: 40 }, outcomes: { description: "원혼이 감동받아 힘을 나눠준다. '그 뜻이라면 돕겠소.'", statChanges: { combat: 3, faith: 2 }, nextFloor: true } },
      { text: "'살아남기 위해 싸웁니다'", outcomes: { description: "원혼이 고개를 끄덕인다. '솔직한 대답이오. 길을 열어드리지.'", healthChange: 30, nextFloor: true } },
      { text: "비문을 읽어준다", requirements: { intelligence: 40 }, outcomes: { description: "원혼이 마침내 성불한다. 강한 축복이 남는다.", statChanges: { faith: 3, morality: 2 }, healthChange: 50, nextFloor: true } },
    ]},

  // ── 검은 세계수 전용 ──────────────────────────────────────────────────────
  { id: "worldtree-corruption", type: "secret", title: "부패한 나무의 기억", description: "세계수 뿌리에 손을 대자 흔들리는 기억이 흘러든다. 이 나무가... 울고 있다.", icon: "🌑", floorRange: [1,29],
    choices: [
      { text: "기억을 받아들인다", requirements: { faith: 45 }, outcomes: { description: "세계수의 고통을 이해했다. 세계에 대한 이해가 깊어진다.", statChanges: { faith: 3, magic: 2 }, nextFloor: true } },
      { text: "정화의 기도를 올린다", requirements: { faith: 55, morality: 50 }, outcomes: { description: "한 가지 뿌리가 정화됐다. 세계수가 빛을 발한다.", statChanges: { faith: 5 }, healthChange: 40, nextFloor: true } },
      { text: "어둠의 힘을 흡수한다", requirements: { magic: 50 }, outcomes: { description: "어둠의 힘이 몸에 스며든다. 강해졌지만... 도덕심이 흔들린다.", statChanges: { magic: 5, morality: -3 }, nextFloor: true } },
    ]},
  { id: "worldtree-spirit", type: "fairy", title: "세계수의 정령", description: "병들어가는 정령이 모습을 드러낸다. '이 나무를... 구할 수 있는 방법은 없는 걸까...'", icon: "🍃", floorRange: [5,20],
    choices: [
      { text: "위로해준다", outcomes: { description: "정령이 감사해하며 치유의 이슬을 건넨다.", healthChange: 45, nextFloor: true } },
      { text: "세계수의 역사를 묻는다", requirements: { intelligence: 50 }, outcomes: { description: "정령이 세계수의 기원을 알려준다. 놀라운 사실을 알게 됐다.", statChanges: { intelligence: 3 }, nextFloor: true } },
      { text: "빛의 기도로 정화한다", requirements: { faith: 60 }, outcomes: { description: "정령이 잠시 밝아진다. '당신 같은 사람이 더 많다면...'", statChanges: { faith: 4, magic: 2 }, healthChange: 30, nextFloor: true } },
    ]},

  // ── 세계의 끝 전용 ────────────────────────────────────────────────────────
  { id: "worldsend-goddess", type: "goddess", title: "여신의 현현", description: "눈부신 빛 속에서 아름다운 존재가 나타난다. '오랫동안 기다렸단다, 용감한 아이야.'", icon: "👼", floorRange: [1,20],
    choices: [
      { text: "경배한다", requirements: { faith: 60, morality: 50 }, outcomes: { description: "'이 갑옷을 받아라, 빛의 전사여.' 성기사 갑옷!", statChanges: { faith: 8 }, outfitReward: "holy-knight", nextFloor: true } },
      { text: "'나와 마왕은 원래 하나였나요?'를 묻는다", requirements: { intelligence: 60 }, outcomes: { description: "여신이 슬픈 눈으로 대답한다. '...그렇단다. 우리는 원래 같은 존재였어.' 깊은 진실을 알게 됐다.", worldKnowledgeChange: 30, nextFloor: true } },
      { text: "도움을 구한다", outcomes: { description: "여신이 빛의 축복을 내려준다.", healthChange: 80, nextFloor: true } },
    ]},
  { id: "worldsend-truth", type: "secret", title: "세계의 기억", description: "세계의 끝 절벽에 새겨진 비문. '태초에 하나였던 빛과 어둠은 스스로를 나누었다...'", icon: "📜", floorRange: [3,20],
    choices: [
      { text: "비문 전체를 읽는다", requirements: { intelligence: 55 }, outcomes: { description: "세계의 창조 비밀을 알게 됐다. '빛과 어둠은 대립이 아닌 순환이었다.'", worldKnowledgeChange: 25, statChanges: { intelligence: 3 }, nextFloor: true } },
      { text: "손으로 따라 새긴다", requirements: { creativity: 40 }, outcomes: { description: "비문을 따라 새기며 뭔가를 이해했다.", worldKnowledgeChange: 10, statChanges: { creativity: 2 }, nextFloor: true } },
      { text: "경외감만 느끼며 지나간다", outcomes: { description: "뭔가 중요한 것을 놓친 것 같은 느낌.", nextFloor: true } },
    ]},

  // ── 무저갱 전용 ───────────────────────────────────────────────────────────
  { id: "abyss-demonking", type: "demonking", title: "마왕의 그림자", description: "심연에서 어둠이 응집된다. 거대한 존재가 당신을 내려다본다. '인간의 아이가... 여기까지 왔군.'", icon: "😈", floorRange: [1,98],
    choices: [
      { text: "맞서 싸운다", requirements: { combat: 80 }, outcomes: { description: "'강하구나. 마음에 든다.' 마왕이 사라지며 힘을 남긴다.", statChanges: { combat: 5 }, worldKnowledgeChange: 10, nextFloor: true } },
      { text: "'당신은 왜 어둠이 됐나요?'를 묻는다", requirements: { worldKnowledge: 50 }, outcomes: { description: "마왕이 멈춘다. '...세계의 균형을 위해서다. 여신처럼.' 엄청난 비밀을 들었다.", worldKnowledgeChange: 30, nextFloor: true } },
      { text: "거래를 제안한다", requirements: { charm: 50 }, outcomes: { description: "마왕이 미소 짓는다. '재미있는 아이군.' 암흑 기사 갑옷을 건넨다.", outfitReward: "dark-knight", nextFloor: true } },
    ]},
  { id: "abyss-void", type: "secret", title: "공허의 속삭임", description: "끝없는 어둠 속에서 목소리가 들린다. '이 곳엔 아무것도 없다... 너도 사라지지 않겠느냐?'", icon: "🕳️", floorRange: [5,98],
    choices: [
      { text: "공허를 직시한다", requirements: { faith: 50 }, outcomes: { description: "공허를 마주하고도 흔들리지 않았다. 신앙이 더욱 굳건해진다.", statChanges: { faith: 4, morality: 2 }, worldKnowledgeChange: 15, nextFloor: true } },
      { text: "'나는 사라지지 않는다'고 선언한다", requirements: { morality: 60 }, outcomes: { description: "공허가 물러선다. 의지가 어둠을 밀어냈다.", statChanges: { combat: 3, morality: 2 }, nextFloor: true } },
      { text: "공허의 힘을 받아들인다", requirements: { magic: 70 }, outcomes: { description: "공허의 힘이 마법에 스며든다. 강해졌지만 무언가를 잃은 것 같다.", statChanges: { magic: 7, faith: -3 }, worldKnowledgeChange: 20, nextFloor: true } },
    ]},

  // ══ 스토리 이벤트 ══════════════════════════════════════════════
  // 세계의 끝 30층: 여신과의 만남
  {
    id: "worldsend-goddess-final", type: "goddess" as const,
    title: "☀️ 여신의 현현",
    description: "세계의 끝. 30층 심연 너머, 눈부신 빛과 함께 여신이 모습을 드러냈다.\n\n'돌아온 것을 환영하노라, 용감한 아이여. 아직 준비가 되지 않았다면... 돌아가야 한다.'",
    icon: "☀️", floorRange: [30, 30],
    choices: [
      {
        text: "「마왕의 흉갑을 장착하고 나타남」 '저는 준비가 되었습니다.'",
        requirements: { equippedOutfit: "demonking-armor" },
        outcomes: {
          description: "여신이 조용히 눈물을 흘렸다.\n\n'...마왕의 것을 걸치고 나를 찾아오다니. 그이가 아직 당신을 기억하고 있구나.'\n\n여신은 눈물 한 방울을 손바닥에 담아 건넸다. 따뜻하고 눈부셨다.",
          setFlag: "met-goddess-with-armor",
          specialItem: "goddess-tear-blessed",
          endDungeon: true,
        }
      },
      {
        text: "「마왕의 것을 얻고 다시 돌아오겠습니다.」",
        requirements: { flag: "met-demonking" },
        outcomes: {
          description: "'그이를 만났단 말인가... 그렇다면 분명 길을 찾을 수 있을 것이야. 다시 나를 찾아오너라.'",
          setFlag: "met-goddess",
          endDungeon: true,
        }
      },
      {
        text: "'저는 계속 전진하겠습니다.'",
        outcomes: {
          description: "'...무모한 아이로구나. 하지만 그 의지만큼은 인정하지.'\n\n여신이 한 걸음 물러서며 전투 태세를 취했다. 눈부신 빛이 공간을 가득 채웠다.",
          setFlag: "met-goddess",
          startCombat: "goddess-combat",
        }
      },
      {
        text: "'...돌아가겠습니다.'",
        outcomes: {
          description: "'현명한 선택이야. 준비가 되었을 때 다시 오너라.'",
          setFlag: "met-goddess",
          endDungeon: true,
        }
      },
    ]
  },

  // 무저갱 50층: 마왕과의 만남
  {
    id: "abyss-demonking-final", type: "demonking" as const,
    title: "👿 마왕과의 만남",
    description: "무저갱 50층. 어둠 속에서 거대한 기척이 느껴졌다.\n\n'...용사여. 이 심연의 끝까지 당도하였는가. 그 의지만큼은 인정하지.'\n\n마왕이 천천히 몸을 일으켰다.",
    icon: "👿", floorRange: [50, 50],
    choices: [
      {
        text: "「세계 지식 100%」 '...당신의 슬픔이 느껴져요. 여신을 만나야 하지 않으신가요?'",
        requirements: { worldKnowledge: 100 },
        outcomes: {
          description: "마왕이 멈췄다.\n\n긴 침묵. 그의 눈 속에서 무언가가 흔들렸다.\n\n'...어떻게 그것을. 아무도 그 이야기를 할 줄은 몰랐는데.'\n\n마왕은 천천히 손에 쥐고 있던 흉갑을 내밀었다.\n'이것을 가져가라. 그리고... 그녀에게 전해다오. 아직 기억한다고.'",
          setFlag: "met-demonking",
          outfitReward: "demonking-armor",
          endDungeon: true,
        }
      },
      {
        text: "「여신을 만나고 왔음」 '여신이 당신을 기다리고 있어요.'",
        requirements: { flag: "met-goddess" },
        outcomes: {
          description: "'...그녀를 만났단 말인가.'\n\n마왕의 손이 잠시 떨렸다.\n\n'그녀는... 잘 있던가?'\n\n그는 조용히 흉갑을 건네주었다. '받아라. 아마 필요할 것이다.'",
          setFlag: "met-demonking",
          outfitReward: "demonking-armor",
          endDungeon: true,
        }
      },
      {
        text: "'당신과 싸우겠습니다.'",
        outcomes: {
          description: "'...좋다. 오너라. 이 심연에서 살아남은 자라면, 나와 싸울 자격이 있다.'\n\n마왕이 천천히 검을 들었다.",
          setFlag: "met-demonking",
          startCombat: "demon-king",
        }
      },
      {
        text: "'...일단 물러나겠습니다.'",
        outcomes: {
          description: "'현명하군. 준비가 되었을 때 다시 오너라.'\n\n마왕이 어둠 속으로 물러났다.",
          setFlag: "met-demonking",
          endDungeon: true,
        }
      },
    ]
  },
]

// 30 Endings with difficulty stars
export const ENDINGS: Ending[] = [
  // Secret/Legendary (5 stars)
  { id: "world-guardian", title: "세계의 수호자", description: "빛과 어둠의 균형을 이해하고, 세계의 진정한 수호자가 되었습니다. 여신과 마왕 모두가 당신을 인정합니다. 이 세계는 당신이 지키겠지요.", requirements: { worldKnowledge: 90, stats: {magic: 200, faith: 200}, dungeonFloor: 50 }, priority: 1, image: "\u{1F31F}", difficulty: 5, category: "legend" },
  { id: "true-goddess", title: "새로운 여신", description: "세계의 핵심에 닿아 빛 그 자체가 되었습니다. 인간을 넘어선 존재로서 영원히 세계를 비추게 됩니다.", requirements: { worldKnowledge: 95, stats: {faith: 225, magic: 210, morality: 225}, dungeonFloor: 50 }, priority: 0, image: "\u{1F4AB}", difficulty: 5, category: "secret" },
  { id: "demon-queen", title: "마왕의 후계자", description: "어둠의 힘을 받아들여 새로운 마왕이 되었습니다. 두려움의 대상이지만, 세계의 균형을 위해 필요한 존재입니다.", requirements: { worldKnowledge: 80, stats: {combat: 210, magic: 200}, dungeonFloor: 40 }, priority: 2, image: "\u{1F608}", difficulty: 5, category: "dark" },

  // Noble (4 stars)
  { id: "queen", title: "여왕", description: "뛰어난 지성과 매력으로 왕국의 여왕이 되었습니다. 현명하고 자비로운 통치로 백성들에게 사랑받습니다.", requirements: { stats: {intelligence: 200, charm: 200, morality: 150}, minGold: 1000 }, priority: 3, image: "\u{1F451}", difficulty: 4, category: "noble" },
  { id: "archmage", title: "대마법사", description: "마법의 극의에 도달하여 대마법사가 되었습니다. 마법 학원의 수장으로서 후학을 양성합니다.", requirements: { stats: {magic: 225, intelligence: 175} }, priority: 4, image: "\u{1F52E}", difficulty: 4, category: "magic" },
  { id: "holy-knight-ending", title: "성기사", description: "신의 뜻을 받들어 성기사가 되었습니다. 빛의 검으로 악을 물리치고 약자를 보호합니다.", requirements: { stats: {combat: 200, faith: 175, morality: 175} }, priority: 5, image: "\u2694\uFE0F", difficulty: 4, category: "combat" },
  { id: "saint", title: "성녀", description: "깊은 신앙심과 세계에 대한 이해로 성녀가 되었습니다. 기적을 행하며 사람들을 구원합니다.", requirements: { stats: {faith: 210, morality: 200}, worldKnowledge: 60 }, priority: 6, image: "\u271D\uFE0F", difficulty: 4, category: "faith" },

  // Advanced (3 stars)
  { id: "sage", title: "세계의 현자", description: "세계의 비밀을 탐구하여 현자가 되었습니다. 진실을 추구하는 자들의 등불이 됩니다.", requirements: { stats: {intelligence: 200}, worldKnowledge: 70 }, priority: 7, image: "\u{1F4DA}", difficulty: 3, category: "magic" },
  { id: "dark-knight-ending", title: "암흑 기사", description: "마왕의 힘을 받아 암흑 기사가 되었습니다. 어둠의 힘으로 세상의 질서에 도전합니다.", requirements: { stats: {combat: 190, magic: 150}, dungeonFloor: 30 }, priority: 8, image: "\u{1F5A4}", difficulty: 3, category: "dark" },
  { id: "court-mage", title: "궁정 마법사", description: "왕실에서 인정받는 궁정 마법사가 되었습니다. 왕국의 수호를 위해 마법을 사용합니다.", requirements: { stats: {magic: 175, intelligence: 150, charm: 125} }, priority: 9, image: "\u{1F9D9}\u200D\u2640\uFE0F", difficulty: 3, category: "magic" },
  { id: "dragon-slayer", title: "용사", description: "전설의 드래곤을 쓰러뜨리고 용사로 칭송받게 되었습니다. 영웅으로서의 길을 걸어갑니다.", requirements: { stats: {combat: 200, strength: 175}, dungeonFloor: 40 }, priority: 10, image: "\u{1F409}", difficulty: 3, category: "combat" },
  { id: "famous-artist", title: "전설의 예술가", description: "탁월한 예술적 재능으로 대륙에서 가장 유명한 예술가가 되었습니다.", requirements: { stats: {creativity: 210, charm: 150} }, priority: 11, image: "\u{1F3A8}", difficulty: 3, category: "art" },
  { id: "merchant-prince", title: "대상인", description: "뛰어난 상업 수완으로 대륙 최고의 상인이 되었습니다.", requirements: { stats: {charm: 150, intelligence: 125}, minGold: 2000 }, priority: 12, image: "\u{1F4B0}", difficulty: 3, category: "noble" },
  { id: "sword-saint", title: "검성", description: "검의 도를 깨우친 검성이 되었습니다. 한 번의 검기로 산을 가릅니다.", requirements: { stats: {combat: 225, strength: 190} }, priority: 13, image: "\u{1FA78}", difficulty: 3, category: "combat" },

  // Moderate (2 stars)
  { id: "royal-chef", title: "왕실 요리장", description: "최고의 요리 실력으로 왕실 요리장이 되었습니다.", requirements: { stats: {cooking: 210, creativity: 125} }, priority: 14, image: "\u{1F468}\u200D\u{1F373}", difficulty: 2, category: "art" },
  { id: "high-priest", title: "대신관", description: "깊은 신앙심으로 대신관이 되었습니다.", requirements: { stats: {faith: 200, morality: 175} }, priority: 15, image: "\u26EA", difficulty: 2, category: "faith" },
  { id: "adventurer", title: "전설의 모험가", description: "수많은 모험을 통해 전설적인 모험가가 되었습니다.", requirements: { stats: {combat: 160, strength: 150}, dungeonFloor: 20 }, priority: 16, image: "\u{1F5FA}\uFE0F", difficulty: 2, category: "combat" },
  { id: "scholar-ending", title: "대학자", description: "학문에 매진하여 대학의 교수가 되었습니다. 많은 제자들이 당신을 따릅니다.", requirements: { stats: {intelligence: 190, creativity: 100} }, priority: 17, image: "\u{1F393}", difficulty: 2, category: "art" },
  { id: "dancer", title: "왕실 무희", description: "아름다운 춤으로 왕실의 무희가 되었습니다. 모든 이를 매료시킵니다.", requirements: { stats: {charm: 190, creativity: 150} }, priority: 18, image: "\u{1F483}", difficulty: 2, category: "art" },
  { id: "witch-ending", title: "숲의 마녀", description: "깊은 숲에서 마법을 연구하는 마녀가 되었습니다. 마을 사람들이 비밀리에 도움을 구해옵니다.", requirements: { stats: {magic: 175, cooking: 100} }, priority: 19, image: "\u{1F9D9}\u200D\u2640\uFE0F", difficulty: 2, category: "magic" },
  { id: "knight-captain", title: "기사단장", description: "뛰어난 무예와 리더십으로 기사단을 이끌게 되었습니다.", requirements: { stats: {combat: 175, charm: 125, morality: 125} }, priority: 20, image: "\u{1F6E1}\uFE0F", difficulty: 2, category: "combat" },

  // Easy (1 star)
  { id: "good-wife", title: "현모양처", description: "따뜻한 가정을 이루고 행복하게 살았습니다.", requirements: { stats: {housework: 175, cooking: 150, charm: 125} }, priority: 21, image: "\u{1F3E0}", difficulty: 1, category: "life" },
  { id: "baker", title: "마을 빵집 주인", description: "맛있는 빵으로 유명한 빵집을 열었습니다. 소박하지만 행복한 삶입니다.", requirements: { stats: {cooking: 150, charm: 100} }, priority: 22, image: "\u{1F35E}", difficulty: 1, category: "life" },
  { id: "farmer", title: "농부", description: "드넓은 농장을 일구며 자연과 함께 살아갑니다.", requirements: { stats: {strength: 125, housework: 125} }, priority: 23, image: "\u{1F33E}", difficulty: 1, category: "life" },
  { id: "nun", title: "수녀", description: "신앙에 헌신하며 조용한 수도원에서 평화로운 삶을 살아갑니다.", requirements: { stats: {faith: 150, morality: 150} }, priority: 24, image: "\u{1F64F}", difficulty: 1, category: "faith" },
  { id: "bard", title: "음유시인", description: "노래와 이야기로 세상을 떠도는 음유시인이 되었습니다.", requirements: { stats: {charm: 125, creativity: 125} }, priority: 25, image: "\u{1F3B6}", difficulty: 1, category: "art" },
  { id: "mercenary", title: "용병", description: "검 하나를 들고 전장을 누비는 용병이 되었습니다.", requirements: { stats: {combat: 125, strength: 110} }, priority: 26, image: "\u2694\uFE0F", difficulty: 1, category: "combat" },
  { id: "maid", title: "메이드", description: "귀족 가문에서 일하는 메이드가 되었습니다. 성실하고 꼼꼼한 성격으로 인정받습니다.", requirements: { stats: {housework: 140, morality: 100} }, priority: 27, image: "\u{1F9F9}", difficulty: 1, category: "life" },
  { id: "commoner", title: "평범한 시민", description: "평범하지만 행복한 삶을 살았습니다. 소박하지만 충만한 일상입니다.", requirements: {}, priority: 100, image: "\u{1F33B}", difficulty: 1, category: "life" },

  // ── 로맨스 엔딩 ────────────────────────────────────────────────
  { id: "romance-liana",  title: "왕녀와의 약속",       description: "리아나 왕녀와 깊은 인연을 맺었다. 왕궁의 정원에서 두 사람은 영원을 약속했다. {플레이어}는 왕실의 귀빈으로 초대받아 새로운 삶을 시작한다.",
    requirements: { romancedNpc: "liana", stats: {charm: 125, morality: 75} }, priority: 0, image: "👑", difficulty: 5, category: "secret" as const },
  { id: "romance-erika",  title: "교관과 제자, 그 너머",  description: "에리카 교관과의 특별한 관계가 꽃피었다. 두 사람은 함께 왕국 최강의 전사 파트너가 되기로 했다.",
    requirements: { romancedNpc: "erika", stats: {combat: 150} }, priority: 0, image: "⚔️", difficulty: 4, category: "secret" as const },
  { id: "romance-sera",   title: "마법사의 봄",           description: "세라와 함께하는 마법 연구는 세계 최고의 성과를 냈다. 두 사람의 마법이 공명할 때, 세계수조차 반응했다.",
    requirements: { romancedNpc: "sera", stats: {magic: 100} }, priority: 0, image: "✨", difficulty: 3, category: "secret" as const },
  { id: "romance-mina",   title: "상인과 모험가의 여행",  description: "미나와 함께 왕국 곳곳을 여행하는 대상인이 되었다. 돈도 모험도 가득한, 둘만의 여행이 시작된다.",
    requirements: { romancedNpc: "mina", stats: {charm: 75} }, priority: 0, image: "💰", difficulty: 2, category: "secret" as const },
  { id: "romance-kairen", title: "기사의 맹세",            description: "카이렌과 함께 왕국의 수호자가 되었다. 두 사람은 서로의 검이 되어 세계의 평화를 지키겠다고 맹세했다.",
    requirements: { romancedNpc: "kairen", stats: {combat: 125, morality: 100} }, priority: 0, image: "🛡️", difficulty: 5, category: "secret" as const },
  { id: "romance-darius", title: "어둠 속의 빛",           description: "다리우스와 함께 어둠의 세계에 발을 들였다. 그러나 두 사람이 함께라면, 그 어둠도 따뜻하다.",
    requirements: { romancedNpc: "darius", morality: { max: -5 } }, priority: 0, image: "🌑", difficulty: 4, category: "dark" as const },
  { id: "romance-leon",   title: "귀족의 선율",            description: "레온이 {플레이어}를 위해 작곡한 교향곡이 왕국 전역에 울려 퍼졌다. 두 사람의 이름은 예술의 역사에 함께 새겨졌다.",
    requirements: { romancedNpc: "leon", stats: {creativity: 100} }, priority: 0, image: "🌹", difficulty: 3, category: "secret" as const },
  { id: "romance-tom",    title: "평민의 영웅",             description: "톰과 함께, 귀족도 평민도 없는 진짜 실력의 세계를 만들어나가기로 했다. 두 사람의 우정과 사랑은 왕국 전설이 된다.",
    requirements: { romancedNpc: "tom", stats: {strength: 75, morality: 50} }, priority: 0, image: "💪", difficulty: 2, category: "secret" as const },

  // ── 악향 엔딩 ────────────────────────────────────────────────
  { id: "dark-lord",      title: "어둠의 지배자",          description: "도덕을 버리고 힘만을 추구한 결과, {플레이어}는 왕국의 그림자 지배자가 되었다. 누구도 거스를 수 없는 절대 권력. 그것이 {플레이어}가 선택한 길이다.",
    requirements: { morality: { max: -30 }, stats: {combat: 175, magic: 150} }, priority: 1, image: "👿", difficulty: 5, category: "dark" as const },
  { id: "shadow-broker",  title: "그림자 거래상",           description: "다리우스와 함께 왕국의 뒷세계를 장악했다. 표면 아래에서 모든 것을 움직이는 진짜 권력자.",
    requirements: { morality: { max: -20 }, stats: {intelligence: 150} }, priority: 1, image: "🌑", difficulty: 4, category: "dark" as const },
  { id: "dark-witch",     title: "저주받은 마녀",           description: "금지된 마법에 손을 댄 대가로 {플레이어}는 세상으로부터 격리되었다. 그러나 그 힘은 누구도 감히 넘볼 수 없다.",
    requirements: { morality: { max: -25 }, stats: {magic: 200} }, priority: 1, image: "🔮", difficulty: 4, category: "dark" as const },

  // ── 히든 엔딩 ────────────────────────────────────────────────
  { id: "world-savior",   title: "세계의 구원자",
    description: "여신의 눈물을 받아, 빛과 어둠의 균형을 되찾았다. 마왕과 여신, 두 존재를 이어준 {플레이어}의 이름은 세계의 역사에 영원히 새겨졌다. 이것이 진정한 세계의 구원자.",
    requirements: { storyFlag: "met-goddess-with-armor", hasItem: "goddess-tear-blessed" },
    priority: 0, image: "🌟", difficulty: 5, category: "secret" as const },
  { id: "demon-king-victor", title: "마왕을 넘어선 자",
    description: "마왕을 쓰러뜨렸다. 그러나 마왕은 사라지지 않았다. '마왕은 유지되어야 한다. 균형이니까.' {플레이어}는 그 말의 의미를 이해했다. 새로운 균형의 수호자가 된 {플레이어}는, 빛도 어둠도 아닌 그 경계에 선다.",
    requirements: { storyFlag: "defeated-demonking", dungeonFloor: 50 },
    priority: 0, image: "👿", difficulty: 5, category: "secret" as const },
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
  prevScreen: "title" as GameScreen,
  character: { ...initialCharacter, stats: { ...initialStats } },
  gold: 100,
  year: 1,
  month: 1,
  week: 1,
  day: 1,
  weekSchedule: [null, null, null, null, null, null, null],
  weekResult: null,
  resultWeek: 1,
  resultMonth: 1,
  seasonalShopOutfits: [],
  seasonalShopWeapons: [],
  seasonalShopAccessories: ['leather-bracelet','copper-ring','glass-bead','iron-bangle','lucky-charm','scholar-pendant'],
  inventory: [],
  currentEvent: null,
  currentSeasonalEvent: null,
  currentEventResult: null,
  ending: null,
  gameStarted: false,
  eventLog: [],
  dungeon: { ...initialDungeon },
  wanderingMerchantActive: false,
  wanderingMerchantOpen: false,
  seasonalEventsTriggered: [],
  unlockedEndings: loadUnlockedFromStorage(),

  setScreen: (screen) => { const prev = get().screen; set({ prevScreen: prev, screen }) },

  startCharacterCreation: (name, birthday) => {
    set({ character: { ...initialCharacter, name, birthday, stats: { ...initialStats } }, screen: "character-creation" })
  },

  setPersonality: (personality) => {
    const state = get()
    const newStats = { ...state.character.stats }
    for (const [stat, value] of Object.entries(personality.statBonuses)) {
      newStats[stat as keyof Stats] = Math.max(0, Math.min(500, (newStats[stat as keyof Stats] || 0) + (value || 0)))
    }
    set({ character: { ...state.character, personality, stats: newStats }, gameStarted: true, screen: "game" })
    get()._updateSeasonalShop(get().month, get().year)
    get().addLog(`${state.character.name}의 모험이 시작됩니다!`)
  },

  startGame: (name) => {
    set({
      character: { ...initialCharacter, name, stats: { ...initialStats }, equippedWeapon: null, ownedWeapons: [], equippedAccessories: [], ownedAccessories: [], materials: [] },
      gold: 100, year: 1, month: 1, week: 1, day: 1,
      weekSchedule: [null, null, null, null, null, null, null], weekResult: null, resultWeek: 1, resultMonth: 1,
      inventory: [],
      currentEvent: null, currentSeasonalEvent: null, currentEventResult: null,
      ending: null, gameStarted: true, eventLog: [], dungeon: { ...initialDungeon },
      wanderingMerchantActive: false,
      wanderingMerchantOpen: false,
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
      weekSchedule: [null, null, null, null, null, null, null], weekResult: null, resultWeek: 1, resultMonth: 1,
      inventory: [],
      currentEvent: null, currentSeasonalEvent: null, currentEventResult: null,
      ending: null, gameStarted: false, eventLog: [], dungeon: { ...initialDungeon },
      wanderingMerchantActive: false,
      wanderingMerchantOpen: false,
      seasonalEventsTriggered: [], unlockedEndings: prevUnlocked,
      seasonalShopOutfits: [], seasonalShopWeapons: [],
      seasonalShopAccessories: ['leather-bracelet','copper-ring','glass-bead','iron-bangle','lucky-charm','scholar-pendant'],
    })
  },

  // ── NPC 시스템 ─────────────────────────────────────────────────
  getMetNpcs: () => {
    const { character, year, month, dungeon } = get()
    return NPCS.filter(npc => {
      const c = npc.meetCondition
      if (c.year && year < c.year) return false
      if (c.month && year === (c.year ?? 0) && month < c.month) return false
      if (c.stats) {
        for (const [stat, val] of Object.entries(c.stats)) {
          if ((character.stats[stat as keyof Stats] || 0) < (val || 0)) return false
        }
      }
      if (c.morality) {
        const m = character.stats.morality
        if (c.morality.max !== undefined && m > c.morality.max) return false
        if (c.morality.min !== undefined && m < c.morality.min) return false
      }
      if (c.dungeonCleared && !dungeon.clearedDungeons?.includes(c.dungeonCleared as any)) return false
      return true
    })
  },

  talkToNpc: (npcId) => {
    const state = get()
    const { character } = state
    const npc = NPCS.find(n => n.id === npcId)
    if (!npc) return
    const playerName = character.name || "루체"
    const fmt = (s: string) => s.replaceAll("{플레이어}", playerName)

    if ((character.npcTalkedToday ?? []).includes(npcId)) {
      set({ currentEventResult: { title: `${npc.icon} ${npc.name}`, description: fmt(npc.dialogues.daily_limit), icon: npc.icon } })
      return
    }

    const affection = (character.npcAffection ?? {})[npcId] || 0
    const npcMet = character.npcMet ?? []
    let dialogue = npc.dialogues.low

    if (!npcMet.includes(npcId)) {
      const newMet = [...npcMet, npcId]
      set({ character: { ...character, npcMet: newMet, npcTalkedToday: [...(character.npcTalkedToday ?? []), npcId] } })
      set({ currentEventResult: { title: `✨ 새로운 만남: ${npc.name}`, description: fmt(npc.dialogues.first), icon: npc.icon } })
      return
    } else if (affection >= 100) dialogue = npc.dialogues.max
    else if (affection >= 60)  dialogue = npc.dialogues.high
    else if (affection >= 30)  dialogue = npc.dialogues.mid

    let bonus = 1
    if (npc.preferStats) {
      for (const stat of Object.keys(npc.preferStats)) {
        if ((character.stats[stat as keyof Stats] || 0) >= 50) bonus += 0.5
      }
    }
    const affGain = Math.floor(3 * bonus)
    const newAff = Math.min(100, affection + affGain)
    const newAffMap = { ...(character.npcAffection ?? {}), [npcId]: newAff }
    const newTalked = [...(character.npcTalkedToday ?? []), npcId]

    set({ character: { ...character, npcAffection: newAffMap, npcTalkedToday: newTalked } })
    set({ currentEventResult: {
      title: `${npc.icon} ${npc.name} (호감 ${newAff}/100)`,
      description: fmt(dialogue) + (affGain > 0 ? `\n\n💕 호감도 +${affGain}` : ''),
      icon: npc.icon,
    }})
  },

  giftToNpc: (npcId, itemId) => {
    const state = get()
    const { character, inventory } = state
    const npc = NPCS.find(n => n.id === npcId)
    if (!npc || !(character.npcMet ?? []).includes(npcId)) return
    const fmt = (s: string) => s.replaceAll("{플레이어}", character.name || "루체")

    const invItem = inventory.find(i => i.id === itemId)
    if (!invItem || invItem.quantity < 1) return

    let gain = GIFT_GRADES.low.affectionGain
    let dialogue = fmt(npc.dialogues.gift_low)
    if (GIFT_GRADES.high.items.includes(itemId))      { gain = GIFT_GRADES.high.affectionGain; dialogue = fmt(npc.dialogues.gift_high) }
    else if (GIFT_GRADES.mid.items.includes(itemId))  { gain = GIFT_GRADES.mid.affectionGain;  dialogue = fmt(npc.dialogues.gift_high) }

    const affection = (character.npcAffection ?? {})[npcId] || 0
    const newAff = Math.min(100, affection + gain)
    const newAffMap = { ...(character.npcAffection ?? {}), [npcId]: newAff }
    const newInv = inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0)

    let newOwnedAcc = [...(character.ownedAccessories ?? [])]
    let bonusDesc = ''
    if (newAff >= 100 && !newOwnedAcc.includes(npc.giftAccessoryId)) {
      newOwnedAcc.push(npc.giftAccessoryId)
      const giftAcc = NPC_ACCESSORIES.find(a => a.id === npc.giftAccessoryId)
      bonusDesc = `\n\n🎁 특별 선물: ${giftAcc?.name || '전용 장신구'} 획득!`
    }

    set({
      character: { ...character, npcAffection: newAffMap, ownedAccessories: newOwnedAcc },
      inventory: newInv,
      currentEventResult: {
        title: `${npc.icon} ${npc.name} (호감 ${newAff}/100)`,
        description: dialogue + `\n\n💕 호감도 +${gain}` + bonusDesc,
        icon: npc.icon,
      }
    })
  },

  dateNpc: (npcId) => {
    const state = get()
    const { character } = state
    const npc = NPCS.find(n => n.id === npcId)
    if (!npc) return
    const affection = (character.npcAffection ?? {})[npcId] || 0
    if (affection < 60) return
    const playerName = character.name || "루체"

    const gain = 10
    const newAff = Math.min(100, affection + gain)
    set({
      character: { ...character, npcAffection: { ...(character.npcAffection ?? {}), [npcId]: newAff } },
      currentEventResult: { title: `💕 데이트: ${npc.name}`, description: npc.dateDescription.replaceAll("{플레이어}", playerName) + `\n\n💕 호감도 +${gain}`, icon: npc.icon }
    })
  },

  romanceNpc: (npcId) => {
    const state = get()
    const { character } = state
    const npc = NPCS.find(n => n.id === npcId)
    if (!npc) return
    const affection = (character.npcAffection ?? {})[npcId] || 0
    if (affection < 100) return
    const playerName = character.name || "루체"

    if (npc.romanceCondition?.morality) {
      const m = character.stats.morality
      const rc = npc.romanceCondition.morality
      if (rc.min !== undefined && m < rc.min) return
      if (rc.max !== undefined && m > rc.max) return
    }

    set({ character: { ...character, romancedNpc: npcId } })
    set({ currentEventResult: { title: `💖 로맨스: ${npc.name}`, description: `${npc.dialogues.max.replaceAll("{플레이어}", playerName)}\n\n💖 ${npc.name}와(과)의 로맨스가 시작되었습니다!`, icon: npc.icon } })
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
      newStats[stat as keyof Stats] = Math.min(500, Math.max(0, (newStats[stat as keyof Stats] || 0) + (value || 0)))
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
        newStats[stat as keyof Stats] = Math.min(500, Math.max(0, (newStats[stat as keyof Stats] || 0) + (value || 0)))
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
        newStats[stat as keyof Stats] = Math.min(500, Math.max(0, (newStats[stat as keyof Stats] || 0) + (value || 0)))
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
      // 저장 당시 없던 새 필드에 기본값 보장 (마이그레이션)
      const safeCharacter = {
        ...s.character,
        storyFlags:        s.character.storyFlags        ?? [],
        npcAffection:      s.character.npcAffection       ?? {},
        npcMet:            s.character.npcMet             ?? [],
        npcTalkedToday:    s.character.npcTalkedToday     ?? [],
        romancedNpc:       s.character.romancedNpc        ?? null,
        equippedAccessories: s.character.equippedAccessories ?? [],
        ownedOutfits:      s.character.ownedOutfits       ?? ['default'],
        currentOutfit:     s.character.currentOutfit      ?? 'default',
        equippedWeapon:    s.character.equippedWeapon     ?? null,
        worldKnowledge:    s.character.worldKnowledge     ?? 0,
        perkPoints:        s.character.perkPoints         ?? 0,
        unlockedPerks:     s.character.unlockedPerks      ?? [],
      }
      set({
        screen: 'game',
        character: safeCharacter,
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
          currentStats[stat as keyof Stats] = Math.min(500, Math.max(0, (currentStats[stat as keyof Stats] || 0) + change))
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

    // 결과 반영 (resultWeek/Month은 advanceTime 전 현재 값 저장)
    set({
      character: {
        ...character,
        stats: currentStats,
        health: currentHealth,
        stress: currentStress,
      },
      gold: currentGold,
      weekResult: results,
      resultWeek: state.week,
      resultMonth: state.month,
      weekSchedule: [null, null, null, null, null, null, null],
    })

    // 던전 탐험 처리: 결과 저장 후 던전으로 이동
    const hasDungeon = results.some(r => r.activityId === 'dungeon-explore')
    if (hasDungeon) {
      set({
        character: { ...character, stats: currentStats, health: currentHealth, stress: currentStress },
        gold: currentGold,
        weekResult: results,
        resultWeek: state.week,
        resultMonth: state.month,
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

  _updateSeasonalShop: (month: number, year: number) => {
    const getSeason = (m: number) => m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "fall" : "winter"
    const season = getSeason(month)
    const outfits: string[] = []
    const weapons: string[] = []
    const accessories: string[] = ["leather-bracelet","copper-ring","glass-bead","iron-bangle","lucky-charm","scholar-pendant"]
    for (const entry of SEASONAL_SHOP_ENTRIES) {
      const seasonMatch = entry.season && entry.season === season
      const yearMatch = entry.year !== undefined && year >= entry.year
      if (seasonMatch || yearMatch) {
        if (entry.type === "outfit") outfits.push(entry.id)
        else if (entry.type === "weapon") weapons.push(entry.id)
        else if (entry.type === "accessory") accessories.push(entry.id)
      }
    }
    set({ seasonalShopOutfits: outfits, seasonalShopWeapons: weapons, seasonalShopAccessories: accessories })
  },

  buyAccessory: (accId, price) => {
    const state = get()
    const hasThrifty = state.character.unlockedPerks.includes("thrifty")
    const effectivePrice = hasThrifty ? Math.floor(price * 0.9) : price
    if (state.gold < effectivePrice) return false
    if (state.character.ownedAccessories.includes(accId)) return false
    set({ gold: state.gold - effectivePrice, character: { ...state.character, ownedAccessories: [...state.character.ownedAccessories, accId] } })
    return true
  },

  equipAccessory: (accId) => {
    const state = get()
    if (!state.character.ownedAccessories.includes(accId)) return false
    if (state.character.equippedAccessories.includes(accId)) return false
    if (state.character.equippedAccessories.length >= 2) return false
    set({ character: { ...state.character, equippedAccessories: [...state.character.equippedAccessories, accId] } })
    return true
  },

  unequipAccessory: (accId) => {
    set({ character: { ...get().character, equippedAccessories: get().character.equippedAccessories.filter(id => id !== accId) } })
  },

  getAccessoriesEffect: () => {
    const { equippedAccessories } = get().character
    const result = { attackBonus: 0, magicBonus: 0, hpBonus: 0, critChance: 0, defenseBonus: 0, goldMultiplier: 0, stressReduce: 0, xpBonus: 0 }
    for (const id of equippedAccessories) {
      const acc = [...ACCESSORIES, ...NPC_ACCESSORIES].find(a => a.id === id)
      if (!acc) continue
      const e = acc.effect
      if (e.attackBonus)    result.attackBonus    += e.attackBonus
      if (e.magicBonus)     result.magicBonus     += e.magicBonus
      if (e.hpBonus)        result.hpBonus        += e.hpBonus
      if (e.critChance)     result.critChance     += e.critChance
      if (e.defenseBonus)   result.defenseBonus   += e.defenseBonus
      if (e.goldMultiplier) result.goldMultiplier += e.goldMultiplier
      if (e.stressReduce)   result.stressReduce   += e.stressReduce
      if (e.xpBonus)        result.xpBonus        += e.xpBonus
    }
    return result
  },

  buyItem: (item, quantity = 1) => {
    const state = get()
    // thrifty 특성: 상점 가격 10% 할인
    const hasThrifty = state.character.unlockedPerks.includes('thrifty')
    const effectiveUnitPrice = hasThrifty ? Math.floor(item.price * 0.9) : item.price
    const totalCost = effectiveUnitPrice * quantity
    if (state.gold < totalCost) return false
    const existingItem = state.inventory.find((i) => i.id === item.id)
    if (existingItem) {
      set({ gold: state.gold - totalCost, inventory: state.inventory.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i) })
    } else {
      set({ gold: state.gold - totalCost, inventory: [...state.inventory, { ...item, quantity }] })
    }
    get().addLog(`${item.name}을(를) ${quantity}개 구매했습니다!`)
    return true
  },

  dismissWanderingMerchant: () => {
    set({ wanderingMerchantOpen: false })
  },

  openWanderingMerchant: () => {
    set({ wanderingMerchantOpen: true })
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
      else newStats[key as keyof Stats] = Math.min(500, Math.max(0, (newStats[key as keyof Stats] || 0) + (value || 0)))
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
        const availableEvents = SEASONAL_EVENTS.filter(e =>
          e.season === season &&
          !state.seasonalEventsTriggered.includes(`${year}-${e.id}`) &&
          (e.minYear === undefined || year >= e.minYear) &&
          (e.maxYear === undefined || year <= e.maxYear)
        )
        if (availableEvents.length > 0) {
          const event = availableEvents[Math.floor(Math.random() * availableEvents.length)]
          set({ currentSeasonalEvent: event, seasonalEventsTriggered: [...state.seasonalEventsTriggered, `${year}-${event.id}`], screen: "seasonal" })
        }
      }

      // 생일 이벤트는 executeWeek 일별 처리에서 담당 (여기서는 제거)

      if (month > 12) {
        month = 1
        year++
        set({ character: { ...get().character, age: get().character.age + 1 } })
        get().addLog(`새해가 밝았습니다! ${get().character.name}은(는) 이제 ${get().character.age}살입니다.`)
        if (get().character.worldKnowledge >= 80 && !get().character.ownedOutfits.includes("celestial")) {
          get().addOutfit("celestial")
        }
        // 연도 한정 상점 갱신
        get()._updateSeasonalShop(month, year)
      }
    }

    // 매주 NPC 대화 제한 초기화
    // 방랑상인: 각 시즌 2번째 달, 2주차에 방문 (2, 5, 8, 11월 2주)
    const merchantActive = week === 2 && [2, 5, 8, 11].includes(month)
    set({ year, month, week, day: (week - 1) * 7 + 1,
      character: { ...get().character, npcTalkedToday: [] },
      wanderingMerchantActive: merchantActive,
      wanderingMerchantOpen: merchantActive,  // 도착하면 팝업 자동 오픈
    })

    // 월 변경 시 계절 상점 갱신
    if (week === 1) get()._updateSeasonalShop(month, get().year)

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

  debugJumpTo: (targetYear, targetMonth, targetWeek) => {
    const state = get()
    const clampedMonth = Math.max(1, Math.min(12, targetMonth))
    const clampedWeek = Math.max(1, Math.min(4, targetWeek))
    const clampedYear = Math.max(1, Math.min(8, targetYear))
    const age = 9 + clampedYear  // 1년차=10살
    set({
      year: clampedYear,
      month: clampedMonth,
      week: clampedWeek,
      day: (clampedWeek - 1) * 7 + 1,
      character: {
        ...state.character,
        age,
        npcTalkedToday: [],
      },
    })
    get()._updateSeasonalShop(clampedMonth, clampedYear)
    get().addLog(`🛠️ [디버그] ${clampedYear}년차 ${clampedMonth}월 ${clampedWeek}주차로 이동했습니다.`)
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
      if (ending.requirements.romancedNpc && state.character.romancedNpc !== ending.requirements.romancedNpc) qualifies = false
      if (ending.requirements.morality) {
        const m = state.character.stats.morality
        if (ending.requirements.morality.min !== undefined && m < ending.requirements.morality.min) qualifies = false
        if (ending.requirements.morality.max !== undefined && m > ending.requirements.morality.max) qualifies = false
      }
      if (ending.requirements.storyFlag && !state.character.storyFlags.includes(ending.requirements.storyFlag)) qualifies = false
      if (ending.requirements.hasItem && !state.inventory.find(i => i.id === ending.requirements.hasItem && i.quantity > 0)) qualifies = false
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
      if (ending.requirements.romancedNpc && state.character.romancedNpc !== ending.requirements.romancedNpc) qualifies = false
      if (ending.requirements.morality) {
        const m = state.character.stats.morality
        if (ending.requirements.morality.min !== undefined && m < ending.requirements.morality.min) qualifies = false
        if (ending.requirements.morality.max !== undefined && m > ending.requirements.morality.max) qualifies = false
      }
      if (ending.requirements.storyFlag && !state.character.storyFlags.includes(ending.requirements.storyFlag)) qualifies = false
      if (ending.requirements.hasItem && !state.inventory.find(i => i.id === ending.requirements.hasItem && i.quantity > 0)) qualifies = false
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

  // ── 무기 ──────────────────────────────────────────────────────────────
  equipWeapon: (weaponId) => {
    const state = get()
    set({ character: { ...state.character, equippedWeapon: weaponId } })
  },
  addWeapon: (weaponId) => {
    const state = get()
    if (!state.character.ownedWeapons.includes(weaponId)) {
      set({ character: { ...state.character, ownedWeapons: [...state.character.ownedWeapons, weaponId] } })
    }
  },
  buyWeapon: (weaponId, price) => {
    const state = get()
    if (state.gold < price || state.character.ownedWeapons.includes(weaponId)) return false
    set({
      gold: state.gold - price,
      character: { ...state.character, ownedWeapons: [...state.character.ownedWeapons, weaponId] }
    })
    return true
  },

  // ── 재료 ──────────────────────────────────────────────────────────────
  addMaterial: (materialId, qty = 1) => {
    const state = get()
    const existing = state.character.materials.find(m => m.id === materialId)
    const newMaterials = existing
      ? state.character.materials.map(m => m.id === materialId ? { ...m, quantity: m.quantity + qty } : m)
      : [...state.character.materials, { id: materialId, quantity: qty }]
    set({ character: { ...state.character, materials: newMaterials } })
  },

  // ── 조합 ──────────────────────────────────────────────────────────────
  craftRecipe: (recipeId) => {
    const state = get()
    const recipe = RECIPES.find(r => r.id === recipeId)
    if (!recipe) return false

    // 재료 충족 확인
    for (const ing of recipe.ingredients) {
      const invItem = state.inventory.find(i => i.id === ing.id)
      const matItem = state.character.materials.find(m => m.id === ing.id)
      const weapItem = state.character.ownedWeapons.includes(ing.id) ? 1 : 0
      const have = (invItem?.quantity || 0) + (matItem?.quantity || 0) + weapItem
      if (have < ing.quantity) return false
    }

    // 재료 소비 (craftSaveChance: 확률적으로 재료 1개 절약)
    const craftSave = get().getPerksEffect().craftSaveChance
    let newInventory = [...state.inventory]
    let newMaterials = [...state.character.materials]
    let newWeapons = [...state.character.ownedWeapons]

    for (const ing of recipe.ingredients) {
      // 절약 적용: quantity > 1일 때 확률로 1 감소
      const savedQty = (craftSave > 0 && ing.quantity > 1 && Math.random() < craftSave) ? 1 : 0
      let need = ing.quantity - savedQty
      // 인벤토리에서 먼저 차감
      newInventory = newInventory.map(i => {
        if (i.id === ing.id && need > 0) {
          const take = Math.min(need, i.quantity)
          need -= take
          return { ...i, quantity: i.quantity - take }
        }
        return i
      }).filter(i => i.quantity > 0)
      // 재료에서 차감
      if (need > 0) {
        newMaterials = newMaterials.map(m => {
          if (m.id === ing.id && need > 0) {
            const take = Math.min(need, m.quantity)
            need -= take
            return { ...m, quantity: m.quantity - take }
          }
          return m
        }).filter(m => m.quantity > 0)
      }
      // 무기에서 소모
      if (need > 0 && state.character.ownedWeapons.includes(ing.id)) {
        newWeapons = newWeapons.filter(w => w !== ing.id)
      }
    }

    // 결과 지급
    if (recipe.resultType === 'weapon') {
      newWeapons = [...newWeapons, recipe.resultId]
      set({
        character: { ...state.character, materials: newMaterials, ownedWeapons: newWeapons },
        inventory: newInventory,
        currentEventResult: {
          title: `⚒️ 제작 완료!`,
          description: recipe.description,
          icon: recipe.icon,
        }
      })
    } else if (recipe.resultType === 'outfit') {
      const newOutfits = state.character.ownedOutfits.includes(recipe.resultId)
        ? state.character.ownedOutfits
        : [...state.character.ownedOutfits, recipe.resultId]
      set({
        character: { ...state.character, materials: newMaterials, ownedOutfits: newOutfits },
        inventory: newInventory,
        currentEventResult: {
          title: `✨ 제작 완료!`,
          description: recipe.description,
          icon: recipe.icon,
          outfitReward: recipe.resultId,
        }
      })
    } else if (recipe.resultType === 'accessory') {
      const newOwned = state.character.ownedAccessories?.includes(recipe.resultId)
        ? state.character.ownedAccessories
        : [...(state.character.ownedAccessories || []), recipe.resultId]
      set({
        character: { ...state.character, materials: newMaterials, ownedAccessories: newOwned, ownedWeapons: newWeapons },
        inventory: newInventory,
        currentEventResult: {
          title: `💍 제작 완료!`,
          description: recipe.description,
          icon: recipe.icon,
        }
      })
    } else {
      // item
      const allItems: Item[] = [...ITEMS, ...CRAFTED_ITEMS]
      const resultItem = allItems.find(i => i.id === recipe.resultId)
      if (resultItem) {
        const existing = newInventory.find(i => i.id === recipe.resultId)
        if (existing) {
          newInventory = newInventory.map(i => i.id === recipe.resultId ? { ...i, quantity: i.quantity + recipe.resultQuantity } : i)
        } else {
          newInventory = [...newInventory, { ...resultItem, quantity: recipe.resultQuantity }]
        }
      }
      set({
        character: { ...state.character, materials: newMaterials },
        inventory: newInventory,
        currentEventResult: {
          title: `⚗️ 제작 완료!`,
          description: recipe.description,
          icon: recipe.icon,
        }
      })
    }
    return true
  },

  // ── 던전 선택 & 준비 ───────────────────────────────────────────────────
  selectDungeon: (dungeonId) => {
    // 무저갱: 세계의 이해 50% 이상 필요
    if (dungeonId === 'abyss' && get().character.worldKnowledge < 50) return
    set({ dungeon: { ...get().dungeon, currentDungeonId: dungeonId }, screen: 'dungeon-prep' })
  },

  setPotionSlots: (slots) => {
    set({ dungeon: { ...get().dungeon, potionSlots: slots } })
  },

  usePotionInDungeon: (itemId) => {
    const state = get()
    const { dungeon, character } = state
    // 슬롯에 등록된 수량 vs 이미 사용한 수량 비교 (인벤토리는 입장 시 이미 차감됨)
    const slotCount = dungeon.potionSlots.filter(p => p === itemId).length
    const usedCount = dungeon.usedPotions.filter(p => p === itemId).length
    if (slotCount === 0 || usedCount >= slotCount) return
    const item = [...ITEMS, ...CRAFTED_ITEMS].find(i => i.id === itemId)
    if (!item) return

    // 효과 적용
    const newStats = { ...character.stats }
    let hpChange = 0
    let stressChange = 0
    for (const [key, val] of Object.entries(item.effect)) {
      if (key === 'health') hpChange += (val || 0)
      else if (key === 'stress') stressChange += (val || 0)
      else newStats[key as keyof Stats] = Math.min(500, (newStats[key as keyof Stats] || 0) + (val || 0))
    }
    const potionEff = get().getPerksEffect()
    const boostedHP = hpChange > 0 ? Math.floor(hpChange * (1 + potionEff.potionBonus)) : hpChange
    const newHP = Math.min(dungeon.maxHP, dungeon.currentHP + boostedHP)

    set({
      character: { ...character, stats: newStats, stress: Math.max(0, character.stress + stressChange) },
      dungeon: {
        ...dungeon,
        currentHP: newHP,
        usedPotions: [...dungeon.usedPotions, itemId],
        combatLog: [...dungeon.combatLog, `💊 ${item.name} 사용! HP +${boostedHP}`],
      }
    })
  },

  // ── 던전 시스템 ─────────────────────────────────────────────────────────
  startDungeon: () => {
    const state = get()
    const dungeonId = state.dungeon.currentDungeonId
    if (!dungeonId) return
    // 던전 입장 시 1주 소비
    get().advanceTime()
    const dungeonDef = DUNGEONS.find(d => d.id === dungeonId)
    const perksHP = get().getPerksEffect()
    const accHP = get().getAccessoriesEffect()
    const currentOutfitData = OUTFITS.find(o => o.id === state.character.currentOutfit)
    const outfitHP = currentOutfitData?.statBonuses?.hpBonus || 0
    const maxHP = Math.floor(100 + state.character.stats.strength * 0.5 + state.character.stats.combat * 0.3 + perksHP.hpBonus + accHP.hpBonus + outfitHP)
    // 슬롯에 등록된 포션을 인벤토리에서 차감
    let newInventory = [...get().inventory]
    for (const itemId of state.dungeon.potionSlots) {
      const idx = newInventory.findIndex(i => i.id === itemId && i.quantity > 0)
      if (idx !== -1) {
        newInventory = newInventory.map((i, n) =>
          n === idx ? { ...i, quantity: i.quantity - 1 } : i
        ).filter(i => i.quantity > 0)
      }
    }

    set({
      inventory: newInventory,
      dungeon: {
        ...state.dungeon,
        active: true, floor: 1,
        maxFloors: dungeonDef?.floors || 20,
        maxFloorReached: state.dungeon.maxFloorReached,
        currentHP: maxHP, maxHP,
        currentEncounter: null, currentEnemy: null, enemyHP: 0,
        combatLog: [`🏰 ${dungeonDef?.name || '던전'}에 입장했습니다...`],
        loot: { gold: 0, statGains: {}, materials: [] },
        usedPotions: [],
      },
      screen: 'dungeon',
    })
    get().addLog(`${dungeonDef?.name || '던전'}에 입장했습니다!`)
    setTimeout(() => get().proceedDungeon(), 300)
  },

  proceedDungeon: () => {
    const state = get()
    const { dungeon } = state
    const dungeonId = dungeon.currentDungeonId
    const maxFloors = dungeon.maxFloors
    const isAbyss = dungeonId === 'abyss'

    // 보스층 체크
    const isBossFloor = isAbyss
      ? (dungeon.floor % 10 === 0)   // 10층마다 중간 보스
      : dungeon.floor === maxFloors

    if (isBossFloor) {
      const boss = DUNGEON_ENEMIES.find(e => e.isBoss && (
        isAbyss
          ? (e.dungeonId === 'abyss' && e.id !== 'boss-abyss' && e.id !== 'demon-king') || (dungeon.floor === 50 && e.id === 'boss-abyss')
          : e.dungeonId === dungeonId
      ))
      if (boss) {
        const scaledHP = boss.hp  // 보스는 스케일 없음
        set({ dungeon: { ...dungeon, currentEnemy: boss, enemyHP: scaledHP, currentEncounter: null,
          combatLog: [...dungeon.combatLog, `⚠️ BOSS: ${boss.name}!`] } })
        return
      }
    }

    // 일반 층: 60% 적, 20% 인카운터, 20% 빈칸(자동 진행)
    const roll = Math.random()
    if (roll < 0.6) {
      const enemies = DUNGEON_ENEMIES.filter(e => {
        const ids = Array.isArray(e.dungeonId) ? e.dungeonId : [e.dungeonId]
        return ids.includes(dungeonId as DungeonId) && !e.isBoss
          && e.floorRange[0] <= dungeon.floor && e.floorRange[1] >= dungeon.floor
      })
      const enemy = enemies.length > 0 ? enemies[Math.floor(Math.random() * enemies.length)] : DUNGEON_ENEMIES[0]
      const scaledHP = Math.floor(enemy.hp * (1 + dungeon.floor * 0.05))
      set({ dungeon: { ...dungeon, currentEnemy: enemy, enemyHP: scaledHP, currentEncounter: null,
        combatLog: [...dungeon.combatLog, `${dungeon.floor}층: ${enemy.name} 출현!`] } })
    } else if (roll < 0.8) {
      // 인카운터 (던전별 전용 포함)
      const dungeonSpecific: Record<string, string[]> = {
        worldsend: ['goddess-vision'],
        abyss: ['demon-king-shadow'],
      }
      const specificIds = dungeonId ? (dungeonSpecific[dungeonId] || []) : []
      const allEncounters = DUNGEON_ENCOUNTERS.filter(e =>
        e.floorRange[0] <= dungeon.floor && e.floorRange[1] >= dungeon.floor
        && (specificIds.length === 0 || !['goddess-vision','demon-king-shadow'].includes(e.id) || specificIds.includes(e.id))
      )
      if (allEncounters.length > 0) {
        const enc = allEncounters[Math.floor(Math.random() * allEncounters.length)]
        set({ dungeon: { ...dungeon, currentEncounter: enc, currentEnemy: null,
          combatLog: [...dungeon.combatLog, `${dungeon.floor}층: ${enc.title}`] } })
      } else {
        // 빈 층
        const newFloor = dungeon.floor + 1
        set({ dungeon: { ...dungeon, floor: newFloor, combatLog: [...dungeon.combatLog, `${dungeon.floor}층 통과...`] } })
        if (newFloor > maxFloors && !isAbyss) setTimeout(() => get().endDungeon(true), 300)
        else setTimeout(() => get().proceedDungeon(), 300)
      }
    } else {
      // 빈 층
      const newFloor = dungeon.floor + 1
      set({ dungeon: { ...dungeon, floor: newFloor, combatLog: [...dungeon.combatLog, `${dungeon.floor}층: 조용하다...`] } })
      if (newFloor > maxFloors && !isAbyss) setTimeout(() => get().endDungeon(true), 300)
      else setTimeout(() => get().proceedDungeon(), 300)
    }
  },

  attackEnemy: () => {
    const state = get()
    const { dungeon, character } = state
    if (!dungeon.currentEnemy) return
    const enemy = dungeon.currentEnemy
    const weapon = dungeon.currentDungeonId ? WEAPONS.find(w => w.id === character.equippedWeapon) : null
    const weaponAtk = weapon?.attackBonus || 0
    const perksEff = get().getPerksEffect()
    const accEff = get().getAccessoriesEffect()
    const weaponCrit = weapon?.critChance || 0
    const totalCritChance = Math.min(0.75, perksEff.critChance + accEff.critChance + weaponCrit)  // 최대 75%
    const isCrit = Math.random() < totalCritChance
    const critMult = isCrit ? (1.5 + perksEff.critMultiplier) : 1.0
    const playerAttack = Math.floor((10 + character.stats.combat * 0.8 + character.stats.strength * 0.4 + weaponAtk + perksEff.attackBonus + accEff.attackBonus + Math.random() * 10) * critMult)
    const playerDamage = Math.max(1, playerAttack - Math.max(0, enemy.defense - perksEff.defenseBonus - accEff.defenseBonus))
    const newEnemyHP = dungeon.enemyHP - playerDamage
    const newLog = [...dungeon.combatLog, isCrit ? `💥 치명타! ${enemy.name}에게 ${playerDamage} 데미지!` : `⚔️ ${enemy.name}에게 ${playerDamage} 데미지!`]

    if (newEnemyHP <= 0) {
      get()._handleEnemyKill(enemy, newLog)
    } else {
      const enemyDamage = Math.max(1, Math.floor(enemy.attack * (0.8 + Math.random() * 0.4)) - Math.floor(character.stats.strength * 0.3))
      const newPlayerHP = dungeon.currentHP - enemyDamage
      if (newPlayerHP <= 0) {
        set({ dungeon: { ...dungeon, currentHP: 0, enemyHP: newEnemyHP, combatLog: [...newLog, `${enemy.name}의 반격! ${enemyDamage} 피해!`, '쓰러졌습니다...'] } })
        setTimeout(() => get().endDungeon(false), 1000)
      } else {
        set({ dungeon: { ...dungeon, currentHP: newPlayerHP, enemyHP: newEnemyHP, combatLog: [...newLog, `${enemy.name}의 반격! ${enemyDamage} 피해!`] } })
      }
    }
  },

  useMagicAttack: () => {
    const state = get()
    const { dungeon, character } = state
    if (!dungeon.currentEnemy) return
    const enemy = dungeon.currentEnemy
    const weapon = WEAPONS.find(w => w.id === character.equippedWeapon)
    const weaponMagic = weapon?.magicAttackBonus || 0
    const perksEffMagic = get().getPerksEffect()
    const accEffMagic = get().getAccessoriesEffect()
    const weaponCritMagic = weapon?.critChance || 0
    const totalCritMagic = Math.min(0.75, perksEffMagic.critChance + accEffMagic.critChance + weaponCritMagic)
    const isCritMagic = Math.random() < totalCritMagic
    const critMultMagic = isCritMagic ? (1.5 + perksEffMagic.critMultiplier) : 1.0
    const magicPower = Math.floor((15 + character.stats.magic * 1.2 + character.stats.intelligence * 0.3 + weaponMagic + perksEffMagic.magicBonus + Math.random() * 15) * critMultMagic)
    const magicDamage = Math.max(1, magicPower - enemy.magicResist)
    const newEnemyHP = dungeon.enemyHP - magicDamage
    const newLog = [...dungeon.combatLog, isCritMagic ? `💥 치명타 마법! ${enemy.name}에게 ${magicDamage} 데미지!` : `✨ 마법 공격! ${enemy.name}에게 ${magicDamage} 데미지!`]

    if (newEnemyHP <= 0) {
      get()._handleEnemyKill(enemy, newLog)
    } else {
      const enemyDamage = Math.max(1, Math.floor(enemy.attack * (0.6 + Math.random() * 0.3)) - Math.floor(character.stats.magic * 0.2))
      const newPlayerHP = dungeon.currentHP - enemyDamage
      if (newPlayerHP <= 0) {
        set({ dungeon: { ...dungeon, currentHP: 0, enemyHP: newEnemyHP, combatLog: [...newLog, `${enemy.name}의 반격! ${enemyDamage} 피해!`, '쓰러졌습니다...'] } })
        setTimeout(() => get().endDungeon(false), 1000)
      } else {
        set({ dungeon: { ...dungeon, currentHP: newPlayerHP, enemyHP: newEnemyHP, combatLog: [...newLog, `${enemy.name}의 반격! ${enemyDamage} 피해!`] } })
      }
    }
  },

  _handleEnemyKill: (enemy: DungeonEnemy, log: string[]) => {
    const state = get()
    const { dungeon, character } = state
    const isAbyss = dungeon.currentDungeonId === 'abyss'
    const maxFloors = dungeon.maxFloors

    // ── 경험치 & 레벨업 처리 ─────────────────────────────────
    const perksEff = get().getPerksEffect()
    const xpGained = Math.floor(enemy.xp * (1 + perksEff.xpBonus))
    let newXP = character.xp + xpGained
    let newLevel = character.level
    let newPerkPoints = character.perkPoints
    let levelUpCount = 0
    while (newLevel < 10 && newXP >= LEVEL_XP_TABLE[newLevel]) {
      newLevel++
      newPerkPoints++
      levelUpCount++
    }
    const xpLog = levelUpCount > 0
      ? `⬆️ 레벨 업! Lv.${newLevel} (특성 포인트 +${levelUpCount})`
      : `✦ XP +${xpGained} (${newXP}/${LEVEL_XP_TABLE[newLevel]})`

    // 스탯 보상
    const dungeonGold = Math.floor(enemy.goldReward * (1 + perksEff.goldDungeonBonus))
    const newLoot = {
      gold: dungeon.loot.gold + dungeonGold,
      statGains: { ...dungeon.loot.statGains },
      materials: [...dungeon.loot.materials],
    }
    for (const [stat, value] of Object.entries(enemy.expReward)) {
      newLoot.statGains[stat as keyof Stats] = (newLoot.statGains[stat as keyof Stats] || 0) + (value || 0)
    }

    let killLog = [...log, `${enemy.name} 처치! (+${dungeonGold}G)`, xpLog]

    // 재료 드롭
    if (enemy.materialDrop) {
      const dropChance = enemy.isBoss ? 1.0 : 0.3
      if (Math.random() < dropChance) {
        const mat = MATERIALS.find(m => m.id === enemy.materialDrop)
        if (mat) {
          newLoot.materials.push({ id: mat.id, quantity: 1 })
          killLog = [...killLog, `💎 재료 드롭: ${mat.name}!`]
        }
      }
    }

    // 보스 처치 후 던전 클리어 처리
    if (enemy.isBoss && !isAbyss) {
      const dungeonId = dungeon.currentDungeonId!
      const clearedDungeons = state.dungeon.clearedDungeons.includes(dungeonId)
        ? state.dungeon.clearedDungeons
        : [...state.dungeon.clearedDungeons, dungeonId]
      const isFirstClear = !state.dungeon.clearedDungeons.includes(dungeonId)
      const dungeonNames: Record<string, string> = { forest:'변방의 숲', valley:'설원 골짜기', fortress:'핏빛 성채', worldtree:'검은 세계수', worldsend:'세계의 끝' }
      const clearLog = [`🏆 ${dungeonNames[dungeonId] || dungeonId} 클리어!`]
      if (isFirstClear) clearLog.push('🎊 최초 클리어! 특성 포인트 +1')

      // 세계의 끝 보스 처치 → 여신 이벤트
      if (dungeonId === 'worldsend' && enemy.id !== 'goddess-combat') {
        const goddessEncounter = DUNGEON_ENCOUNTERS.find(e => e.id === 'worldsend-goddess-final')
        set({
          character: { ...character, xp: newXP, level: newLevel, perkPoints: newPerkPoints + (isFirstClear ? 1 : 0) },
          dungeon: {
            ...dungeon, currentEnemy: null, enemyHP: 0, loot: newLoot, clearedDungeons,
            currentEncounter: goddessEncounter || null,
            combatLog: [...killLog, ...clearLog, '✨ 세계의 끝 너머에서 빛이 느껴진다...'],
          },
        })
        return
      }

      set({
        character: { ...character, xp: newXP, level: newLevel, perkPoints: newPerkPoints + (isFirstClear ? 1 : 0) },
        dungeon: {
          ...dungeon, currentEnemy: null, enemyHP: 0, loot: newLoot,
          clearedDungeons,
          combatLog: [...killLog, ...clearLog],
        },
      })
      setTimeout(() => get().endDungeon(true), 1000)
      return
    }

    // 무저갱 최종 보스 (floor 50) → 마왕 이벤트
    if (enemy.isBoss && isAbyss && enemy.id === 'boss-abyss') {
      const demonKingEncounter = DUNGEON_ENCOUNTERS.find(e => e.id === 'abyss-demonking-final')
      set({
        character: { ...character, xp: newXP, level: newLevel, perkPoints: newPerkPoints },
        dungeon: {
          ...dungeon, currentEnemy: null, enemyHP: 0, loot: newLoot,
          currentEncounter: demonKingEncounter || null,
          combatLog: [...killLog, '심연의 끝... 어둠 속에서 거대한 기척이 느껴진다.'],
        },
      })
      return
    }

    // 마왕 직접 처치 시 → 히든 엔딩 트리거
    if (enemy.id === 'demon-king') {
      const newFlags = character.storyFlags.includes('defeated-demonking')
        ? character.storyFlags : [...character.storyFlags, 'defeated-demonking']
      set({
        character: { ...character, xp: newXP, level: newLevel, perkPoints: newPerkPoints, storyFlags: newFlags },
        dungeon: { ...dungeon, currentEnemy: null, enemyHP: 0, loot: newLoot,
          combatLog: [...killLog,
            '👿 마왕이 쓰러졌다.',
            '...침묵. 심연 전체가 숨을 죽였다.',
            '"...그래. 네가 이겼다. 하지만 기억해라. 마왕은 유지되어야 한다. 균형이니까."',
            '마왕은 어둠 속으로 사라졌다.',
          ]
        },
      })
      setTimeout(() => get().endDungeon(true), 2000)
      return
    }

    // 일반 무저갱 보스 (10층마다)
    if (enemy.isBoss && isAbyss) {
      const newFloor = dungeon.floor + 1
      set({
        character: { ...character, xp: newXP, level: newLevel, perkPoints: newPerkPoints },
        dungeon: { ...dungeon, floor: newFloor, currentEnemy: null, enemyHP: 0, loot: newLoot,
          maxFloorReached: Math.max(newFloor, dungeon.maxFloorReached),
          combatLog: [...killLog, `${newFloor}층으로...`] } })
      setTimeout(() => get().proceedDungeon(), 500)
      return
    }

    const newFloor = dungeon.floor + 1
    const newMaxFloor = Math.max(newFloor, dungeon.maxFloorReached)
    set({
      character: { ...character, xp: newXP, level: newLevel, perkPoints: newPerkPoints },
      dungeon: { ...dungeon, floor: newFloor, currentEnemy: null, enemyHP: 0, loot: newLoot,
        maxFloorReached: newMaxFloor, combatLog: [...killLog, `${newFloor}층으로 진행...`] },
    })
    if (newFloor > maxFloors && !isAbyss) setTimeout(() => get().endDungeon(true), 500)
    else setTimeout(() => get().proceedDungeon(), 500)
  },

  fleeDungeon: () => {
    const state = get()
    const { dungeon } = state
    const escapeChance = Math.max(0.3, 0.7 - dungeon.floor * 0.01)
    if (Math.random() < escapeChance) {
      set({ dungeon: { ...dungeon, combatLog: [...dungeon.combatLog, '도망에 성공했습니다!'] } })
      setTimeout(() => get().endDungeon(true), 500)
    } else {
      const damage = Math.floor(10 + dungeon.floor * 2)
      const newHP = dungeon.currentHP - damage
      if (newHP <= 0) {
        set({ dungeon: { ...dungeon, currentHP: 0, combatLog: [...dungeon.combatLog, `도망 실패! ${damage} 피해!`, '쓰러졌습니다...'] } })
        setTimeout(() => get().endDungeon(false), 1000)
      } else {
        set({ dungeon: { ...dungeon, currentHP: newHP, combatLog: [...dungeon.combatLog, `도망 실패! ${damage} 피해!`] } })
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
        if (key === 'worldKnowledge') {
          if (character.worldKnowledge < (value || 0)) { set({ dungeon: { ...dungeon, combatLog: [...dungeon.combatLog, '세계에 대한 이해가 부족합니다...'] } }); return }
        } else if (key === 'flag') {
          if (!character.storyFlags.includes(value as string)) { set({ dungeon: { ...dungeon, combatLog: [...dungeon.combatLog, '조건이 충족되지 않았습니다...'] } }); return }
        } else if (key === 'notFlag') {
          if (character.storyFlags.includes(value as string)) { set({ dungeon: { ...dungeon, combatLog: [...dungeon.combatLog, '이미 다른 선택을 했습니다...'] } }); return }
        } else if (key === 'equippedOutfit') {
          if (character.currentOutfit !== (value as string)) { set({ dungeon: { ...dungeon, combatLog: [...dungeon.combatLog, '특정 복장을 착용해야 합니다...'] } }); return }
        } else if ((character.stats[key as keyof Stats] || 0) < (value || 0)) {
          set({ dungeon: { ...dungeon, combatLog: [...dungeon.combatLog, '능력치가 부족합니다...'] } }); return
        }
      }
    }

    const outcome = choice.outcomes
    const newStats = { ...character.stats }
    if (outcome.statChanges) {
      for (const [stat, value] of Object.entries(outcome.statChanges)) {
        newStats[stat as keyof Stats] = Math.min(500, Math.max(0, (newStats[stat as keyof Stats] || 0) + (value || 0)))
      }
    }
    const newHP = Math.min(dungeon.maxHP, Math.max(0, dungeon.currentHP + (outcome.healthChange || 0)))
    const newWorldKnowledge = Math.min(100, Math.max(0, character.worldKnowledge + (outcome.worldKnowledgeChange || 0)))
    const newGold = Math.max(0, state.gold + (outcome.goldChange || 0))
    const hasOutfit = outcome.outfitReward && !character.ownedOutfits.includes(outcome.outfitReward)

    set({
      character: { ...character, stats: newStats, worldKnowledge: newWorldKnowledge },
      gold: newGold,
      dungeon: {
        ...dungeon, currentHP: newHP, currentEncounter: null,
        loot: { ...dungeon.loot, gold: dungeon.loot.gold + Math.max(0, outcome.goldChange || 0) },
        combatLog: [...dungeon.combatLog, outcome.description],
      },
      ...(hasOutfit ? {
        currentEventResult: {
          title: dungeon.currentEncounter?.title || '아이템 획득',
          description: outcome.description,
          icon: dungeon.currentEncounter?.icon || '🎁',
          statChanges: outcome.statChanges,
          outfitReward: outcome.outfitReward,
        }
      } : {}),
    })

    // 스토리 플래그 설정
    if (outcome.setFlag) {
      const flags = get().character.storyFlags
      if (!flags.includes(outcome.setFlag)) {
        set({ character: { ...get().character, storyFlags: [...flags, outcome.setFlag] } })
      }
    }

    // 특수 아이템 지급
    if (outcome.specialItem) {
      const allItems = [...ITEMS, ...CRAFTED_ITEMS]
      const item = allItems.find(i => i.id === outcome.specialItem)
      if (item) {
        const inv = get().inventory
        const existing = inv.find(i => i.id === item.id)
        const newInv = existing
          ? inv.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
          : [...inv, { ...item, quantity: 1 }]
        set({ inventory: newInv })
      }
    }

    // 전투 시작
    if (outcome.startCombat) {
      const enemy = DUNGEON_ENEMIES.find(e => e.id === outcome.startCombat)
      if (enemy) {
        set({ dungeon: { ...get().dungeon, currentEncounter: null, currentEnemy: enemy, enemyHP: enemy.hp,
          combatLog: [...get().dungeon.combatLog, `⚠️ ${enemy.name}이(가) 나타났다!`] } })
        return
      }
    }

    if (outcome.endDungeon) {
      setTimeout(() => get().endDungeon(true), 500)
    } else if (outcome.nextFloor) {
      const newFloor = dungeon.floor + 1
      const isAbyss = dungeon.currentDungeonId === 'abyss'
      set({ dungeon: { ...get().dungeon, floor: newFloor, maxFloorReached: Math.max(newFloor, dungeon.maxFloorReached) } })
      if (newFloor > dungeon.maxFloors && !isAbyss) setTimeout(() => get().endDungeon(true), 500)
      else setTimeout(() => get().proceedDungeon(), 500)
    }
  },

  endDungeon: (success) => {
    const state = get()
    const { dungeon, character } = state
    const dungeonDef = DUNGEONS.find(d => d.id === dungeon.currentDungeonId)

    // 스탯 보상 적용
    const newStats = { ...character.stats }
    for (const [stat, value] of Object.entries(dungeon.loot.statGains)) {
      newStats[stat as keyof Stats] = Math.min(500, (newStats[stat as keyof Stats] || 0) + (value || 0))
    }

    // 재료 지급
    let newMaterials = [...character.materials]
    for (const drop of dungeon.loot.materials) {
      const existing = newMaterials.find(m => m.id === drop.id)
      if (existing) {
        newMaterials = newMaterials.map(m => m.id === drop.id ? { ...m, quantity: m.quantity + drop.quantity } : m)
      } else {
        newMaterials = [...newMaterials, { id: drop.id, quantity: drop.quantity }]
      }
    }

    // 세계의 지식 보상 (세계의 끝/무저갱 클리어 시)
    let worldKnowledge = character.worldKnowledge
    if (success && dungeonDef?.worldKnowledgeReward) {
      worldKnowledge = Math.min(100, worldKnowledge + dungeonDef.worldKnowledgeReward)
    }

    const finalGold = success ? state.gold + dungeon.loot.gold : state.gold + Math.floor(dungeon.loot.gold / 2)
    const dungeonName = dungeonDef?.name || '던전'
    const materialCount = dungeon.loot.materials.length

    set({
      character: { ...character, stats: newStats, materials: newMaterials, worldKnowledge,
        level: character.level, xp: character.xp, perkPoints: character.perkPoints, unlockedPerks: character.unlockedPerks },
      gold: finalGold,
      dungeon: {
        ...initialDungeon,
        clearedDungeons: dungeon.clearedDungeons,
        maxFloorReached: dungeon.maxFloorReached,
        currentDungeonId: null,
        potionSlots: [],  // 다음 던전 전에 새로 설정
      },
      screen: 'game',
    })
    if (success) get().addLog(`${dungeonName} 탐험 완료! ${dungeon.loot.gold}G 획득${materialCount > 0 ? `, 재료 ${materialCount}종 획득` : ''}`)
    else get().addLog(`던전에서 쓰러졌습니다... ${Math.floor(dungeon.loot.gold / 2)}G만 회수`)
    // advanceTime은 startDungeon 진입 시 이미 소비 → 여기서 호출 안 함
  },

  resetPerks: () => {
    const state = get()
    if (state.gold < PERK_RESET_COST) return false
    set({
      gold: state.gold - PERK_RESET_COST,
      character: {
        ...state.character,
        unlockedPerks: [],
        perkPoints: state.character.perkPoints + state.character.unlockedPerks.length,
      }
    })
    return true
  },

  unlockPerk: (perkId) => {
    const state = get()
    const { character } = state
    const perk = PERKS.find(p => p.id === perkId)
    if (!perk) return false
    if (character.perkPoints < perk.cost) return false
    if (character.unlockedPerks.includes(perkId)) return false
    if (character.unlockedPerks.length >= MAX_PERK_SLOTS) return false
    // 선행 특성 확인
    if (perk.requires) {
      for (const req of perk.requires) {
        if (!character.unlockedPerks.includes(req)) return false
      }
    }
    set({
      character: {
        ...character,
        perkPoints: character.perkPoints - perk.cost,
        unlockedPerks: [...character.unlockedPerks, perkId],
      }
    })
    return true
  },

  getPerksEffect: () => {
    const { character } = get()
    const result = { attackBonus: 0, magicBonus: 0, goldMultiplier: 0, potionBonus: 0, maxPotionSlots: 0, hpBonus: 0, xpBonus: 0, stressReduce: 0, activityBonus: 0, craftSaveChance: 0, goldDungeonBonus: 0, defenseBonus: 0, critChance: 0, critMultiplier: 0 }
    for (const perkId of character.unlockedPerks) {
      const perk = PERKS.find(p => p.id === perkId)
      if (!perk) continue
      const e = perk.effect
      if (e.attackBonus) result.attackBonus += e.attackBonus
      if (e.magicBonus) result.magicBonus += e.magicBonus
      if (e.goldMultiplier) result.goldMultiplier += e.goldMultiplier
      if (e.potionBonus) result.potionBonus += e.potionBonus
      if (e.maxPotionSlots) result.maxPotionSlots += e.maxPotionSlots
      if (e.hpBonus) result.hpBonus += e.hpBonus
      if (e.xpBonus) result.xpBonus += e.xpBonus
      if (e.stressReduce) result.stressReduce += e.stressReduce
      if (e.activityBonus) result.activityBonus += e.activityBonus
      if (e.craftSaveChance) result.craftSaveChance += e.craftSaveChance
      if (e.goldDungeonBonus) result.goldDungeonBonus += e.goldDungeonBonus
      if (e.defenseBonus) result.defenseBonus += e.defenseBonus
      if (e.critChance) result.critChance += e.critChance
      if (e.critMultiplier) result.critMultiplier += e.critMultiplier
    }
    return result
  },
})
)
