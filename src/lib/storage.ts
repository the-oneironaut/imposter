import { STORAGE_KEYS } from "./constants";
import type { Item, Player, Round, PlayerScore, GameSession } from "./types";

function get<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function remove(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function getItems(): Item[] {
  return get<Item[]>(STORAGE_KEYS.ITEMS, []);
}

export function setItems(items: Item[]): void {
  set(STORAGE_KEYS.ITEMS, items);
}

export function getPlayers(): Player[] {
  return get<Player[]>(STORAGE_KEYS.PLAYERS, []);
}

export function setPlayers(players: Player[]): void {
  set(STORAGE_KEYS.PLAYERS, players);
}

export function getUsedItemIds(): string[] {
  return get<string[]>(STORAGE_KEYS.USED_ITEM_IDS, []);
}

export function setUsedItemIds(ids: string[]): void {
  set(STORAGE_KEYS.USED_ITEM_IDS, ids);
}

export function getRounds(): Round[] {
  return get<Round[]>(STORAGE_KEYS.ROUNDS, []);
}

export function setRounds(rounds: Round[]): void {
  set(STORAGE_KEYS.ROUNDS, rounds);
}

export function getScores(): Record<string, PlayerScore> {
  return get<Record<string, PlayerScore>>(STORAGE_KEYS.SCORES, {});
}

export function setScores(scores: Record<string, PlayerScore>): void {
  set(STORAGE_KEYS.SCORES, scores);
}

export function getGameSession(): GameSession | null {
  return get<GameSession | null>(STORAGE_KEYS.GAME_SESSION, null);
}

export function setGameSession(session: GameSession): void {
  set(STORAGE_KEYS.GAME_SESSION, session);
}

export function clearGameSession(): void {
  remove(STORAGE_KEYS.GAME_SESSION);
}

export function getDisabledCategories(): string[] {
  return get<string[]>(STORAGE_KEYS.DISABLED_CATEGORIES, []);
}

export function setDisabledCategories(cats: string[]): void {
  set(STORAGE_KEYS.DISABLED_CATEGORIES, cats);
}

export interface LastRoundSettings {
  playerIds: string[];
  imposterCount: number;
  disabledCategories: string[];
  imposterWordMode: boolean;
}

export function getLastRoundSettings(): LastRoundSettings | null {
  return get<LastRoundSettings | null>(STORAGE_KEYS.LAST_ROUND_SETTINGS, null);
}

export function setLastRoundSettings(s: LastRoundSettings): void {
  set(STORAGE_KEYS.LAST_ROUND_SETTINGS, s);
}
