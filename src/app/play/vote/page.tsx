"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import { GameStatus } from "@/lib/types";
import type { Player, Round } from "@/lib/types";
import { getPlayers, getRounds, setRounds, getScores, setScores } from "@/lib/storage";
import { determineOutcome } from "@/lib/game-logic";
import { computeRoundScores, mergeScores } from "@/lib/scoring";
import { nanoid } from "nanoid";

export default function VotePage() {
  const router = useRouter();
  const { session, dispatch } = useGame();
  const [phase, setPhase] = useState<"handoff" | "vote">("handoff");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);

  useEffect(() => {
    setPlayers(getPlayers());
  }, []);

  useEffect(() => {
    if (session.status === GameStatus.RESULTS) {
      router.push("/play/results");
    }
  }, [session.status, router]);

  if (
    session.status !== GameStatus.VOTING_HANDOFF &&
    session.status !== GameStatus.VOTING_CAST
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
  const otherPlayers = session.playerIds
    .filter((id) => id !== currentPlayerId)
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const handleReady = () => {
    setPhase("vote");
    setSelectedSuspect(null);
    dispatch({ type: "VOTER_READY" });
  };

  const handleVote = () => {
    if (!selectedSuspect) return;
    const newVotes = [...session.votes, { voterId: currentPlayerId, suspectId: selectedSuspect }];
    const nextIndex = session.currentTurnIndex + 1;
    const isLastVote = nextIndex >= session.playerIds.length;

    if (isLastVote && session.actualItemId) {
      // Save round synchronously here — event handlers are not double-called in Strict Mode
      const result = determineOutcome(newVotes, session.imposterIds);
      const rounds = getRounds();
      const round: Round = {
        id: nanoid(),
        roundNumber: rounds.length + 1,
        playerIds: session.playerIds,
        imposterIds: session.imposterIds,
        actualItemId: session.actualItemId,
        decoyItemId: session.decoyItemId,
        imposterWordMode: session.imposterWordMode,
        votes: newVotes,
        result,
        completedAt: new Date().toISOString(),
      };
      setRounds([...rounds, round]);
      const deltas = computeRoundScores(round);
      setScores(mergeScores(getScores(), round, deltas));
      dispatch({ type: "CAST_VOTE_FINAL", votes: newVotes, roundId: round.id });
    } else {
      dispatch({ type: "CAST_VOTE", vote: { voterId: currentPlayerId, suspectId: selectedSuspect } });
    }
    setPhase("handoff");
    setSelectedSuspect(null);
  };

  if (phase === "handoff" || session.status === GameStatus.VOTING_HANDOFF) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-2">Pass the device to</p>
          <h1 className="text-4xl font-bold">{currentPlayer?.name || "..."}</h1>
          <p className="text-gray-500 text-sm mt-4">
            Voter {session.currentTurnIndex + 1} of {session.playerIds.length}
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
    <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
      <div className="text-center">
        <p className="text-gray-400 mb-1">{currentPlayer?.name}, vote for the imposter:</p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        {otherPlayers.map((player) => (
          <button
            key={player.id}
            onClick={() => setSelectedSuspect(player.id)}
            className={`w-full p-4 rounded-lg text-left font-medium transition-colors ${
              selectedSuspect === player.id
                ? "bg-red-900/60 border-2 border-red-500"
                : "bg-gray-800 border-2 border-transparent hover:bg-gray-700"
            }`}
          >
            {player.name}
          </button>
        ))}
      </div>

      <button
        onClick={handleVote}
        disabled={!selectedSuspect}
        className={`py-3 px-8 rounded-lg font-semibold text-lg transition-colors ${
          selectedSuspect
            ? "bg-red-600 hover:bg-red-500"
            : "bg-gray-700 text-gray-500 cursor-not-allowed"
        }`}
      >
        Confirm Vote
      </button>
    </main>
  );
}
