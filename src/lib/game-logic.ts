import type { Item, Vote } from "./types";
import { pickRandom, shuffleArray } from "./random";

export function selectItem(allItems: Item[], usedItemIds: string[]): Item {
  const available = allItems.filter((item) => !usedItemIds.includes(item.id));
  if (available.length === 0) {
    throw new Error("No available items. Reset used items to continue.");
  }
  return pickRandom(available);
}

export function selectDecoyItem(allItems: Item[], actualItemId: string): Item {
  const candidates = allItems.filter((item) => item.id !== actualItemId);
  if (candidates.length === 0) {
    throw new Error("Not enough items to select a decoy.");
  }
  return pickRandom(candidates);
}

export function assignImposters(
  playerIds: string[],
  imposterCount: number
): string[] {
  const maxImposters = Math.floor((playerIds.length - 1) / 2);
  const count = Math.min(Math.max(1, imposterCount), maxImposters);
  const shuffled = shuffleArray(playerIds);
  return shuffled.slice(0, count);
}

export function tallyVotes(votes: Vote[]): Record<string, number> {
  const tally: Record<string, number> = {};
  for (const vote of votes) {
    tally[vote.suspectId] = (tally[vote.suspectId] || 0) + 1;
  }
  return tally;
}

export function determineOutcome(
  votes: Vote[],
  imposterIds: string[]
): "crewmates" | "imposters" {
  const tally = tallyVotes(votes);
  const entries = Object.entries(tally);
  if (entries.length === 0) return "imposters";

  const maxVotes = Math.max(...entries.map(([, count]) => count));
  const topSuspects = entries
    .filter(([, count]) => count === maxVotes)
    .map(([id]) => id);

  if (topSuspects.length > 1) {
    return "imposters";
  }

  const electedSuspect = topSuspects[0];
  return imposterIds.includes(electedSuspect) ? "crewmates" : "imposters";
}
