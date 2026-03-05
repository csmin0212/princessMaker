"use client"

import { useGameStore } from "@/lib/game-store"
import { TitleScreen } from "./title-screen"
import { CharacterCreation } from "./character-creation"
import { GameDashboard } from "./game-dashboard"
import { AdventureScreen } from "./adventure-screen"
import { ShopScreen } from "./shop-screen"
import { InventoryScreen } from "./inventory-screen"
import { EndingScreen } from "./ending-screen"
import { EndingBookScreen } from "./ending-book-screen"
import { DungeonScreen } from "./dungeon-screen"
import { SeasonalEventScreen } from "./seasonal-event-screen"
import { TalkScreen } from "./talk-screen"
import { WardrobeScreen } from "./wardrobe-screen"
import { EndingSelectScreen } from "./ending-select-screen"
import { DungeonSelectScreen } from "./dungeon-select-screen"
import { DungeonPrepScreen } from "./dungeon-prep-screen"
import { NpcScreen } from "./npc-screen"
import { DungeonResultScreen } from "./dungeon-result-screen"
import { CraftScreen } from "./craft-screen"
import { PerkScreen } from "./perk-screen"
import { SettingsScreen } from "./settings-screen"
import { EventResultModal } from "./event-result-modal"

export function Game() {
  const { screen } = useGameStore()

  return (
    <>
      {(() => {
        switch (screen) {
          case "title":
            return <TitleScreen />
          case "character-creation":
            return <CharacterCreation />
          case "game":
          case "schedule":
            return <GameDashboard />
          case "adventure":
            return <AdventureScreen />
          case "shop":
            return <ShopScreen />
          case "inventory":
            return <InventoryScreen />
          case "ending":
            return <EndingScreen />
          case "ending-book":
            return <EndingBookScreen />
          case "ending-select":
            return <EndingSelectScreen />
          case "dungeon-select":
            return <DungeonSelectScreen />
          case "dungeon-prep":
            return <DungeonPrepScreen />
          case "craft":
            return <CraftScreen />
          case "perk":
            return <PerkScreen />
          case "dungeon":
            return <DungeonScreen />
          case "dungeon-result":
            return <DungeonResultScreen />
          case "npc":
            return <NpcScreen />
          case "settings":
            return <SettingsScreen />
          case "seasonal":
            return <SeasonalEventScreen />
          case "talk":
            return <TalkScreen />
          case "wardrobe":
            return <WardrobeScreen />
          default:
            return <TitleScreen />
        }
      })()}
      <EventResultModal />
    </>
  )
}
