"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getItems, getUsedItemIds, getRounds } from "@/lib/storage";
import { useGame } from "@/context/GameContext";
import { GameStatus } from "@/lib/types";

const STATUS_ROUTES: Partial<Record<GameStatus, string>> = {
  [GameStatus.SETUP]: "/play/setup",
  [GameStatus.TURNS_HANDOFF]: "/play/turn",
  [GameStatus.TURNS_REVEAL]: "/play/turn",
  [GameStatus.DISCUSSION]: "/play/discuss",
  [GameStatus.VOTING_HANDOFF]: "/play/vote",
  [GameStatus.VOTING_CAST]: "/play/vote",
  [GameStatus.RESULTS]: "/play/results",
};

export default function HomePage() {
  const router = useRouter();
  const { session, dispatch } = useGame();
  const [stats, setStats] = useState({ totalRounds: 0, availableItems: 0, totalItems: 0 });
  const [hasActiveGame, setHasActiveGame] = useState(false);

  useEffect(() => {
    const items = getItems();
    const usedIds = getUsedItemIds();
    const rounds = getRounds();
    setStats({
      totalRounds: rounds.length,
      availableItems: items.filter((i) => !usedIds.includes(i.id)).length,
      totalItems: items.length,
    });
  }, []);

  useEffect(() => {
    if (session.status !== GameStatus.IDLE) {
      setHasActiveGame(true);
    }
  }, [session.status]);

  const handleResume = () => {
    const route = STATUS_ROUTES[session.status];
    if (route) router.push(route);
  };

  const handleAbandon = () => {
    dispatch({ type: "GO_HOME" });
    setHasActiveGame(false);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-2">🕵️ Imposter</h1>
        <p className="text-gray-400 text-lg">Find the imposter among you</p>
      </div>

      <div className="flex gap-4 text-sm text-gray-500">
        <span>{stats.totalRounds} rounds played</span>
        <span>•</span>
        <span>{stats.availableItems}/{stats.totalItems} items available</span>
      </div>

      {hasActiveGame && (
        <div className="bg-yellow-900/40 border border-yellow-700 rounded-lg p-4 w-full max-w-xs text-center">
          <p className="text-yellow-300 text-sm mb-3">You have a game in progress</p>
          <div className="flex gap-2">
            <button
              onClick={handleResume}
              className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Resume
            </button>
            <button
              onClick={handleAbandon}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Abandon
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/play/setup"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-center font-semibold py-3 px-6 rounded-lg transition-colors text-lg"
        >
          New Round
        </Link>
        <Link
          href="/admin/items"
          className="bg-gray-800 hover:bg-gray-700 text-white text-center font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Manage Items
        </Link>
        <Link
          href="/admin/history"
          className="bg-gray-800 hover:bg-gray-700 text-white text-center font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Game History
        </Link>
      </div>
    </main>
  );
}
