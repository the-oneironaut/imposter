"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Player, Item } from "@/lib/types";
import { getPlayers, getItems } from "@/lib/storage";
import { useScores } from "@/hooks/useScores";

export default function HistoryPage() {
  const { scores, rounds } = useScores();
  const [players, setPlayers] = useState<Player[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    setPlayers(getPlayers());
    setItems(getItems());
  }, []);

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name || "Unknown";
  const getItemText = (id: string) =>
    items.find((i) => i.id === id)?.text || "Unknown";

  const sortedScores = Object.values(scores).sort(
    (a, b) => b.wins - a.wins || (b.correctVotes - a.correctVotes)
  );

  return (
    <main className="flex-1 flex flex-col p-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Game History</h1>
        <Link href="/" className="text-gray-400 hover:text-white text-sm">
          ← Home
        </Link>
      </div>

      {sortedScores.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Leaderboard</h2>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Player</th>
                  <th className="text-center p-3">Wins</th>
                  <th className="text-center p-3">Rounds</th>
                  <th className="text-center p-3">Correct Votes</th>
                  <th className="text-center p-3">Evaded</th>
                </tr>
              </thead>
              <tbody>
                {sortedScores.map((s, i) => (
                  <tr key={s.playerId} className="border-b border-gray-700/50">
                    <td className="p-3 text-gray-500">{i + 1}</td>
                    <td className="p-3 font-medium">{getPlayerName(s.playerId)}</td>
                    <td className="p-3 text-center text-green-400">{s.wins}</td>
                    <td className="p-3 text-center">{s.totalRounds}</td>
                    <td className="p-3 text-center">{s.correctVotes}</td>
                    <td className="p-3 text-center text-purple-400">{s.timesEvaded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3">Past Rounds</h2>
        {rounds.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No rounds played yet.</p>
        ) : (
          <div className="space-y-3">
            {[...rounds].reverse().map((round) => (
              <div key={round.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Round {round.roundNumber}</span>
                  <span
                    className={`text-sm font-medium px-2 py-0.5 rounded ${
                      round.result === "crewmates"
                        ? "bg-green-900 text-green-300"
                        : "bg-red-900 text-red-300"
                    }`}
                  >
                    {round.result === "crewmates" ? "Crewmates Won" : "Imposters Won"}
                  </span>
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>
                    Word: <span className="text-white">{getItemText(round.actualItemId)}</span>
                    {" · "}
                    Decoy: <span className="text-yellow-400">{getItemText(round.decoyItemId)}</span>
                  </p>
                  <p>
                    Imposter{round.imposterIds.length > 1 ? "s" : ""}:{" "}
                    <span className="text-red-400">
                      {round.imposterIds.map(getPlayerName).join(", ")}
                    </span>
                  </p>
                  <p>
                    Players: {round.playerIds.map(getPlayerName).join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
