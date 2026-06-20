"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import { GameStatus } from "@/lib/types";
import { getPlayers, getItems } from "@/lib/storage";
import type { Player, Item } from "@/lib/types";

export default function TurnPage() {
  const router = useRouter();
  const { session, dispatch } = useGame();
  const [phase, setPhase] = useState<"handoff" | "reveal">("handoff");
  const [players, setPlayers] = useState<Player[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    setPlayers(getPlayers());
    setItems(getItems());
  }, []);

  useEffect(() => {
    if (session.status === GameStatus.DISCUSSION) {
      router.push("/play/discuss");
    }
  }, [session.status, router]);

  if (
    session.status !== GameStatus.TURNS_HANDOFF &&
    session.status !== GameStatus.TURNS_REVEAL
  ) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        <p className="text-gray-400">No active game</p>
        <button onClick={() => router.push("/")} className="text-indigo-400 hover:text-indigo-300">Go Home</button>
      </main>
    );
  }

  const currentPlayerId = session.playerIds[session.currentTurnIndex];
  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const isImposter = session.imposterIds.includes(currentPlayerId);
  const wordItemId = isImposter ? session.decoyItemId : session.actualItemId;
  const wordItem = items.find((i) => i.id === wordItemId);

  const handleReady = () => {
    setPhase("reveal");
    dispatch({ type: "PLAYER_READY" });
  };

  const handleDone = () => {
    setPhase("handoff");
    dispatch({ type: "PLAYER_DONE" });
  };

  if (phase === "handoff" || session.status === GameStatus.TURNS_HANDOFF) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-2">Pass the device to</p>
          <h1 className="text-4xl font-bold">{currentPlayer?.name || "..."}</h1>
          <p className="text-gray-500 text-sm mt-4">
            Player {session.currentTurnIndex + 1} of {session.playerIds.length}
          </p>
        </div>
        <button
          onClick={handleReady}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 px-12 rounded-lg text-xl transition-colors"
        >
          I&apos;m Ready
        </button>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center">
        <p className="text-gray-400 mb-4">{currentPlayer?.name}, your word is:</p>
        <div className="bg-gray-800 rounded-2xl p-8 min-w-[280px]">
          <h1 className="text-4xl font-bold tracking-wide">
            {wordItem?.text || "..."}
          </h1>
        </div>
        <p className="text-gray-600 text-xs mt-4">
          Memorize it, then tap below
        </p>
      </div>
      <button
        onClick={handleDone}
        className="bg-green-600 hover:bg-green-500 text-white font-semibold py-4 px-12 rounded-lg text-xl transition-colors"
      >
        Got it
      </button>
    </main>
  );
}
