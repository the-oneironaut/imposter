"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import { GameStatus } from "@/lib/types";
import { DEFAULTS } from "@/lib/constants";
import { getPlayers } from "@/lib/storage";
import { pickRandom } from "@/lib/random";

export default function DiscussPage() {
  const router = useRouter();
  const { session, dispatch } = useGame();
  const [seconds, setSeconds] = useState<number>(DEFAULTS.DISCUSSION_TIMER_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pick once on mount — computed in a ref so it never re-renders.
  const starterName = useRef<string | null>(null);
  if (starterName.current === null && session.playerIds.length > 0) {
    const allPlayers = getPlayers();
    const randomId = pickRandom(session.playerIds);
    starterName.current = allPlayers.find((p) => p.id === randomId)?.name ?? null;
  }

  useEffect(() => {
    if (timerRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning]);

  if (session.status !== GameStatus.DISCUSSION) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        <p className="text-gray-400">No active game</p>
        <button onClick={() => router.push("/")} className="text-indigo-400 hover:text-indigo-300">Go Home</button>
      </main>
    );
  }

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const handleStartVoting = () => {
    dispatch({ type: "START_VOTING" });
    router.push("/play/vote");
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">🗣️ Discussion Time</h1>
        <p className="text-gray-400 text-lg">Talk it out — who is the imposter?</p>
        {starterName.current && (
          <p className="mt-3 text-gray-300">
            Start with{" "}
            <span className="font-semibold text-indigo-400">{starterName.current}</span>
          </p>
        )}
      </div>

      <div className="text-center">
        <div className="text-6xl font-mono font-bold tabular-nums">
          {minutes}:{secs.toString().padStart(2, "0")}
        </div>
        <div className="flex gap-3 mt-4 justify-center">
          {!timerRunning ? (
            <button
              onClick={() => setTimerRunning(true)}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {seconds === DEFAULTS.DISCUSSION_TIMER_SECONDS ? "Start Timer" : "Resume"}
            </button>
          ) : (
            <button
              onClick={() => setTimerRunning(false)}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Pause
            </button>
          )}
          <button
            onClick={() => {
              setTimerRunning(false);
              setSeconds(DEFAULTS.DISCUSSION_TIMER_SECONDS);
            }}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <button
        onClick={handleStartVoting}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 px-12 rounded-lg text-xl transition-colors"
      >
        Start Voting
      </button>
    </main>
  );
}
