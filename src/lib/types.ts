export interface Item {
  id: string;
  text: string;
  category: string;
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  createdAt: string;
}

export interface Vote {
  voterId: string;
  suspectId: string;
}

export interface Round {
  id: string;
  roundNumber: number;
  playerIds: string[];
  imposterIds: string[];
  actualItemId: string;
  decoyItemId: string | null;
  imposterWordMode: boolean;
  votes: Vote[];
  result: "crewmates" | "imposters";
  completedAt: string;
}

export interface PlayerScore {
  playerId: string;
  totalRounds: number;
  roundsAsCrewmate: number;
  roundsAsImposter: number;
  correctVotes: number;
  timesIdentified: number;
  timesEvaded: number;
  wins: number;
}

export enum GameStatus {
  IDLE = "IDLE",
  SETUP = "SETUP",
  ASSIGNING = "ASSIGNING",
  TURNS_HANDOFF = "TURNS_HANDOFF",
  TURNS_REVEAL = "TURNS_REVEAL",
  DISCUSSION = "DISCUSSION",
  VOTING_HANDOFF = "VOTING_HANDOFF",
  VOTING_CAST = "VOTING_CAST",
  RESULTS = "RESULTS",
}

export interface GameSession {
  status: GameStatus;
  playerIds: string[];
  imposterCount: number;
  imposterIds: string[];
  actualItemId: string | null;
  decoyItemId: string | null;
  currentTurnIndex: number;
  revealedPlayers: string[];
  votes: Vote[];
  savedRoundId: string | null;
  imposterWordMode: boolean;
}
