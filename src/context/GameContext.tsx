"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from "react";
import {
  GameStatus,
  type DrawingStroke,
  type GameMode,
  type DrawingMedium,
  type GameSession,
  type Vote,
} from "@/lib/types";
import * as storage from "@/lib/storage";

const initialSession: GameSession = {
  status: GameStatus.IDLE,
  playerIds: [],
  drawingPlayerIds: [],
  imposterCount: 1,
  imposterIds: [],
  actualItemId: null,
  decoyItemId: null,
  currentTurnIndex: 0,
  revealedPlayers: [],
  votes: [],
  savedRoundId: null,
  imposterWordMode: false,
  decoySameCategory: true,
  gameMode: "verbal",
  drawingMedium: "browser",
  drawingStrokes: [],
  drawingRound: 1,
};

type GameAction =
  | { type: "RESTORE_SESSION"; session: GameSession }
  | { type: "START_SETUP" }
  | {
      type: "START_ROUND";
      playerIds: string[];
      drawingPlayerIds?: string[];
      imposterCount: number;
      imposterIds: string[];
      actualItemId: string;
      decoyItemId: string | null;
      imposterWordMode: boolean;
      decoySameCategory: boolean;
      gameMode?: GameMode;
      drawingMedium?: DrawingMedium;
    }
  | { type: "PLAYER_READY" }
  | { type: "PLAYER_DONE" }
  | { type: "START_DISCUSSION" }
  | { type: "START_VOTING" }
  | { type: "VOTER_READY" }
  | { type: "CAST_VOTE"; vote: Vote }
  | { type: "CAST_VOTE_FINAL"; votes: Vote[]; roundId: string }
  | { type: "DRAWING_PLAYER_READY" }
  | { type: "ADD_DRAWING_STROKE"; stroke: DrawingStroke }
  | { type: "DRAWING_PLAYER_DONE" }
  | { type: "START_NEXT_DRAWING_ROUND" }
  | { type: "FINISH_DRAWING" }
  | { type: "SHOW_RESULTS" }
  | { type: "PLAY_AGAIN" }
  | { type: "GO_HOME" };

function gameReducer(state: GameSession, action: GameAction): GameSession {
  switch (action.type) {
    case "RESTORE_SESSION":
      return {
        ...initialSession,
        ...action.session,
        drawingPlayerIds: action.session.drawingPlayerIds ?? action.session.playerIds,
        gameMode: action.session.gameMode ?? "verbal",
        drawingMedium: action.session.drawingMedium ?? "browser",
        drawingStrokes: action.session.drawingStrokes ?? [],
        drawingRound: action.session.drawingRound ?? 1,
      };

    case "START_SETUP":
      return { ...initialSession, status: GameStatus.SETUP };

    case "START_ROUND":
      return {
        ...state,
        status: GameStatus.TURNS_HANDOFF,
        playerIds: action.playerIds,
        drawingPlayerIds: action.drawingPlayerIds ?? action.playerIds,
        imposterCount: action.imposterCount,
        imposterIds: action.imposterIds,
        actualItemId: action.actualItemId,
        decoyItemId: action.decoyItemId,
        imposterWordMode: action.imposterWordMode,
        decoySameCategory: action.decoySameCategory,
        currentTurnIndex: 0,
        revealedPlayers: [],
        votes: [],
        gameMode: action.gameMode ?? "verbal",
        drawingMedium: action.drawingMedium ?? "browser",
        drawingStrokes: [],
        drawingRound: 1,
      };

    case "PLAYER_READY":
      return { ...state, status: GameStatus.TURNS_REVEAL };

    case "PLAYER_DONE": {
      const nextIndex = state.currentTurnIndex + 1;
      const currentPlayerId = state.playerIds[state.currentTurnIndex];
      const newRevealed = [...state.revealedPlayers, currentPlayerId];
      if (nextIndex >= state.playerIds.length) {
        return {
          ...state,
          status:
            state.gameMode === "drawing"
              ? GameStatus.DRAWING_HANDOFF
              : GameStatus.DISCUSSION,
          revealedPlayers: newRevealed,
          currentTurnIndex: state.gameMode === "drawing" ? 0 : nextIndex,
        };
      }
      return {
        ...state,
        status: GameStatus.TURNS_HANDOFF,
        currentTurnIndex: nextIndex,
        revealedPlayers: newRevealed,
      };
    }

    case "DRAWING_PLAYER_READY":
      return { ...state, status: GameStatus.DRAWING_TURN };

    case "ADD_DRAWING_STROKE": {
      const alreadyDrew = state.drawingStrokes.some(
        (stroke) =>
          stroke.playerId === state.drawingPlayerIds[state.currentTurnIndex] &&
          stroke.roundNumber === state.drawingRound
      );
      if (state.gameMode !== "drawing" || alreadyDrew) return state;
      return {
        ...state,
        drawingStrokes: [...state.drawingStrokes, action.stroke],
      };
    }

    case "DRAWING_PLAYER_DONE": {
      const nextIndex = state.currentTurnIndex + 1;
      if (nextIndex >= state.drawingPlayerIds.length) {
        return {
          ...state,
          status: GameStatus.DRAWING_ROUND_END,
          currentTurnIndex: 0,
        };
      }
      return {
        ...state,
        status: GameStatus.DRAWING_HANDOFF,
        currentTurnIndex: nextIndex,
      };
    }

    case "START_NEXT_DRAWING_ROUND":
      return {
        ...state,
        status: GameStatus.DRAWING_HANDOFF,
        currentTurnIndex: 0,
        drawingRound: state.drawingRound + 1,
      };

    case "FINISH_DRAWING":
      return {
        ...state,
        status: GameStatus.VOTING_HANDOFF,
        currentTurnIndex: 0,
        votes: [],
      };

    case "START_DISCUSSION":
      return { ...state, status: GameStatus.DISCUSSION };

    case "START_VOTING":
      return {
        ...state,
        status: GameStatus.VOTING_HANDOFF,
        currentTurnIndex: 0,
        votes: [],
      };

    case "VOTER_READY":
      return { ...state, status: GameStatus.VOTING_CAST };

    case "CAST_VOTE": {
      const newVotes = [...state.votes, action.vote];
      const nextIndex = state.currentTurnIndex + 1;
      return {
        ...state,
        status: GameStatus.VOTING_HANDOFF,
        votes: newVotes,
        currentTurnIndex: nextIndex,
      };
    }

    case "CAST_VOTE_FINAL":
      return {
        ...state,
        status: GameStatus.RESULTS,
        votes: action.votes,
        currentTurnIndex: state.playerIds.length,
        savedRoundId: action.roundId,
      };

    case "SHOW_RESULTS":
      return { ...state, status: GameStatus.RESULTS };

    case "PLAY_AGAIN":
      return { ...initialSession, status: GameStatus.SETUP };

    case "GO_HOME":
      return { ...initialSession, status: GameStatus.IDLE };

    default:
      return state;
  }
}

interface GameContextValue {
  session: GameSession;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(gameReducer, initialSession);

  useEffect(() => {
    const saved = storage.getGameSession();
    if (saved) {
      dispatch({ type: "RESTORE_SESSION", session: saved });
    }
  }, []);

  useEffect(() => {
    if (session.status === GameStatus.IDLE) {
      storage.clearGameSession();
    } else {
      storage.setGameSession(session);
    }
  }, [session]);

  return (
    <GameContext.Provider value={{ session, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
