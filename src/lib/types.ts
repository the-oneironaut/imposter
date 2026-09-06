export interface Item {
  id: string;
  text: string;
  category: string;
  createdAt: string;
}

export type GameMode = "verbal" | "drawing";
export type DrawingMedium = "browser" | "physical";

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  playerId: string;
  roundNumber: number;
  points: DrawingPoint[];
  color: string;
  width: number;
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
  decoySameCategory: boolean;
  votes: Vote[];
  result: "crewmates" | "imposters";
  completedAt: string;
  gameMode?: GameMode;
  drawingMedium?: DrawingMedium;
  drawingStrokes?: DrawingStroke[];
  drawingRounds?: number;
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
  DRAWING_HANDOFF = "DRAWING_HANDOFF",
  DRAWING_TURN = "DRAWING_TURN",
  DRAWING_ROUND_END = "DRAWING_ROUND_END",
}

export interface GameSession {
  status: GameStatus;
  playerIds: string[];
  drawingPlayerIds: string[];
  imposterCount: number;
  imposterIds: string[];
  actualItemId: string | null;
  decoyItemId: string | null;
  currentTurnIndex: number;
  revealedPlayers: string[];
  votes: Vote[];
  savedRoundId: string | null;
  imposterWordMode: boolean;
  decoySameCategory: boolean;
  gameMode: GameMode;
  drawingMedium: DrawingMedium;
  drawingStrokes: DrawingStroke[];
  drawingRound: number;
}
