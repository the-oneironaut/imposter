"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import { GameStatus } from "@/lib/types";
import type { Player, Item, Round } from "@/lib/types";
import { getPlayers, getItems, getRounds } from "@/lib/storage";
import { tallyVotes } from "@/lib/game-logic";
import { computeRoundScores } from "@/lib/scoring";
import type { ScoreDelta } from "@/lib/scoring";

export default function ResultsPage() {
  const router = useRouter();
  const { session, dispatch } = useGame();
  const [players, setPlayersState] = useState<Player[]>([]);
  const [items, setItemsState] = useState<Item[]>([]);
  const [savedRound, setSavedRound] = useState<Round | null>(null);
  const [scoreDeltas, setScoreDeltas] = useState<ScoreDelta[]>([]);

  useEffect(() => {
    setPlayersState(getPlayers());
    setItemsState(getItems());
  }, []);

  // Read the already-saved round from localStorage — no saving here
  useEffect(() => {
    if (session.status !== GameStatus.RESULTS || !session.savedRoundId) return;
    const round = getRounds().find((r) => r.id === session.savedRoundId);
    if (round) {
      setSavedRound(round);
      setScoreDeltas(computeRoundScores(round));
    }
  }, [session.status, session.savedRoundId]);

  if (session.status !== GameStatus.RESULTS || !savedRound) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        <p className="text-gray-400">No results to display</p>
        <button onClick={() => router.push("/")} className="text-indigo-400 hover:text-indigo-300">Go Home</button>
      </main>
    );
  }

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name || "Unknown";
  const getItemText = (id: string) =>
    items.find((i) => i.id === id)?.text || "Unknown";

  const tally = tallyVotes(savedRound.votes);
  const crewmatesWon = savedRound.result === "crewmates";

  return (
    <main className="flex-1 flex flex-col p-6 max-w-lg mx-auto w-full gap-6">
      <div
        className={`text-center p-6 rounded-2xl ${
          crewmatesWon ? "bg-green-900/30" : "bg-red-900/30"
        }`}
      >
        <h1 className="text-3xl font-bold mb-2">
          {crewmatesWon ? "🎉 Crewmates Win!" : "🕵️ Imposters Win!"}
        </h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-sm font-medium text-gray-400 mb-2">The Imposter{savedRound.imposterIds.length > 1 ? "s" : ""}</h2>
        <p className="text-xl font-bold text-red-400">
          {savedRound.imposterIds.map(getPlayerName).join(", ")}
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-sm font-medium text-gray-400 mb-2">Words</h2>
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-gray-500">Real Word</p>
            <p className="text-lg font-bold text-green-400">
              {getItemText(savedRound.actualItemId)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Imposter&apos;s Word</p>
            <p className="text-lg font-bold text-yellow-400">
              {savedRound.imposterWordMode
                ? "Imposter"
                : getItemText(savedRound.decoyItemId ?? "")}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-sm font-medium text-gray-400 mb-3">Vote Breakdown</h2>
        <div className="space-y-2">
          {savedRound.votes.map((vote, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-300">{getPlayerName(vote.voterId)}</span>
              <span className="text-gray-500">voted for</span>
              <span
                className={`font-medium ${
                  savedRound.imposterIds.includes(vote.suspectId)
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {getPlayerName(vote.suspectId)}
                {savedRound.imposterIds.includes(vote.suspectId) ? " ✓" : ""}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700">
          <h3 className="text-xs text-gray-500 mb-1">Vote Tally</h3>
          {Object.entries(tally)
            .sort(([, a], [, b]) => b - a)
            .map(([id, count]) => (
              <div key={id} className="flex items-center justify-between text-sm">
                <span
                  className={
                    savedRound.imposterIds.includes(id) ? "text-red-400" : ""
                  }
                >
                  {getPlayerName(id)}
                  {savedRound.imposterIds.includes(id) ? " (imposter)" : ""}
                </span>
                <span className="font-mono">
                  {count} vote{count !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
        </div>
      </div>

      {scoreDeltas.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-400 mb-3">Score Changes</h2>
          <div className="space-y-2">
            {scoreDeltas
              .sort((a, b) => b.points - a.points)
              .map((delta) => (
                <div key={delta.playerId} className="flex items-center justify-between text-sm">
                  <span
                    className={savedRound.imposterIds.includes(delta.playerId) ? "text-red-400" : "text-gray-300"}
                  >
                    {getPlayerName(delta.playerId)}
                    {savedRound.imposterIds.includes(delta.playerId) ? " (imposter)" : ""}
                  </span>
                  <span className={`font-mono font-medium ${
                    delta.points > 0 ? "text-green-400" : "text-gray-500"
                  }`}>
                    {delta.points > 0 ? "+" : ""}{delta.points} pt{delta.points !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => {
            dispatch({ type: "PLAY_AGAIN" });
            router.push("/play/setup");
          }}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Play Again
        </button>
        <button
          onClick={() => {
            dispatch({ type: "GO_HOME" });
            router.push("/");
          }}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Home
        </button>
      </div>
    </main>
  );
}
