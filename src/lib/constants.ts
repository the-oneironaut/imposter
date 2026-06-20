export const STORAGE_KEYS = {
  ITEMS: "imposter:items",
  PLAYERS: "imposter:players",
  USED_ITEM_IDS: "imposter:usedItemIds",
  ROUNDS: "imposter:rounds",
  SCORES: "imposter:scores",
  GAME_SESSION: "imposter:gameSession",
} as const;

export const LIMITS = {
  MIN_ITEMS: 3,
  MAX_PLAYER_NAME: 30,
  MAX_ITEM_TEXT: 100,
  MIN_PLAYERS_BASE: 3,
} as const;

export const DEFAULTS = {
  IMPOSTER_COUNT: 1,
  DISCUSSION_TIMER_SECONDS: 120,
} as const;
