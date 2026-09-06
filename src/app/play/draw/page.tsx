"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { useGame } from "@/context/GameContext";
import { GameStatus } from "@/lib/types";
import type { DrawingPoint, Player } from "@/lib/types";
import { getPlayers } from "@/lib/storage";
import DrawingCanvas from "@/components/DrawingCanvas";

const DRAWING_COLORS = [
  { value: "#1f2937", label: "Ink" },
  { value: "#dc2626", label: "Red" },
  { value: "#2563eb", label: "Blue" },
  { value: "#059669", label: "Green" },
  { value: "#d97706", label: "Amber" },
];

const DRAWING_WIDTHS = [
  { value: 5, label: "Fine" },
  { value: 9, label: "Medium" },
  { value: 14, label: "Bold" },
];

const DRAWING_STATUSES = [
  GameStatus.DRAWING_HANDOFF,
  GameStatus.DRAWING_TURN,
  GameStatus.DRAWING_ROUND_END,
];

export default function DrawPage() {
  const router = useRouter();
  const { session, dispatch } = useGame();
  const [players, setPlayers] = useState<Player[]>([]);
  const [color, setColor] = useState(DRAWING_COLORS[0].value);
  const [strokeWidth, setStrokeWidth] = useState(DRAWING_WIDTHS[1].value);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPlayers(getPlayers()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (session.status === GameStatus.DISCUSSION) {
      if (session.gameMode === "drawing") {
        dispatch({ type: "START_VOTING" });
        router.push("/play/vote");
      } else {
        router.push("/play/discuss");
      }
    }
  }, [dispatch, router, session.gameMode, session.status]);

  const isDrawingStatus = DRAWING_STATUSES.includes(session.status);
  if (!isDrawingStatus || session.gameMode !== "drawing") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        <p className="text-gray-400">No active drawing game</p>
        <button onClick={() => router.push("/")} className="text-indigo-400 hover:text-indigo-300">Go Home</button>
      </main>
    );
  }

  const currentPlayerId = session.drawingPlayerIds[session.currentTurnIndex];
  const currentPlayer = players.find((player) => player.id === currentPlayerId);
  const hasCurrentStroke = session.drawingStrokes.some(
    (stroke) =>
      stroke.playerId === currentPlayerId &&
      stroke.roundNumber === session.drawingRound
  );
  const isBrowserBoard = session.drawingMedium === "browser";
  const isRoundEnd = session.status === GameStatus.DRAWING_ROUND_END;
  const isTurn = session.status === GameStatus.DRAWING_TURN;

  const handleReady = () => {
    dispatch({ type: "DRAWING_PLAYER_READY" });
  };

  const handleStrokeComplete = (points: DrawingPoint[]) => {
    if (!currentPlayerId || hasCurrentStroke || !isTurn) return;
    dispatch({
      type: "ADD_DRAWING_STROKE",
      stroke: {
        id: nanoid(),
        playerId: currentPlayerId,
        roundNumber: session.drawingRound,
        points,
        color,
        width: strokeWidth,
      },
    });
  };

  const handleDone = () => {
    if (isBrowserBoard && !hasCurrentStroke) return;
    dispatch({ type: "DRAWING_PLAYER_DONE" });
  };

  const handleNextRound = () => {
    dispatch({ type: "START_NEXT_DRAWING_ROUND" });
  };

  const handleFinish = () => {
    dispatch({ type: "FINISH_DRAWING" });
    router.push("/play/vote");
  };

  if (isRoundEnd) {
    return (
      <main className="flex-1 flex flex-col p-6 max-w-3xl mx-auto w-full gap-6">
        <div className="text-center">
          <p className="text-emerald-400 text-sm font-medium uppercase tracking-wider">Drawing round {session.drawingRound} complete</p>
          <h1 className="text-3xl font-bold mt-2">The board is ready</h1>
          <p className="text-gray-400 mt-2">Everyone added one mark. Keep the board as it is or build on it once more.</p>
        </div>

        {isBrowserBoard ? (
          <DrawingCanvas
            strokes={session.drawingStrokes}
            disabled
            ariaLabel="Final shared drawing"
          />
        ) : (
          <div className="rounded-xl border border-emerald-900/70 bg-emerald-950/30 p-5 text-center text-emerald-100">
            Keep the physical drawing visible for voting.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={handleNextRound}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Add another round
          </button>
          <button
            onClick={handleFinish}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Finish and vote
          </button>
        </div>
      </main>
    );
  }

  if (session.status === GameStatus.DRAWING_HANDOFF) {
    return (
      <main className="flex-1 flex flex-col p-6 max-w-3xl mx-auto w-full gap-6">
        <div className="text-center">
          <p className="text-emerald-400 text-sm font-medium uppercase tracking-wider">Drawing round {session.drawingRound}</p>
          <p className="text-gray-400 text-lg mt-4">Pass the device to</p>
          <h1 className="text-4xl font-bold mt-1">{currentPlayer?.name || "..."}</h1>
          <p className="text-gray-500 text-sm mt-3">
            Mark {session.currentTurnIndex + 1} of {session.drawingPlayerIds.length}
          </p>
        </div>

        {isBrowserBoard ? (
          <DrawingCanvas
            strokes={session.drawingStrokes}
            disabled
            ariaLabel="Shared drawing so far"
          />
        ) : (
          <div className="rounded-xl border border-emerald-900/70 bg-emerald-950/30 p-5 text-center text-emerald-100">
            Use the shared paper or whiteboard. The app will keep the turn order for you.
          </div>
        )}

        <button
          onClick={handleReady}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 px-12 rounded-lg text-xl transition-colors self-center"
        >
          I&apos;m ready to draw
        </button>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col p-6 max-w-3xl mx-auto w-full gap-5">
      <div className="text-center">
        <p className="text-emerald-400 text-sm font-medium uppercase tracking-wider">Drawing round {session.drawingRound}</p>
        <h1 className="text-3xl font-bold mt-2">{currentPlayer?.name}, add one mark</h1>
        <p className="text-gray-400 mt-2">Use the word you saw earlier. Do not show or say it.</p>
      </div>

      {isBrowserBoard ? (
        <>
          <DrawingCanvas
            strokes={session.drawingStrokes}
            color={color}
            strokeWidth={strokeWidth}
            onStrokeComplete={handleStrokeComplete}
            disabled={hasCurrentStroke}
            ariaLabel="Draw one mark on the shared board"
          />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">Color</p>
              <div className="flex gap-2" role="group" aria-label="Pen color">
                {DRAWING_COLORS.map((drawingColor) => (
                  <button
                    key={drawingColor.value}
                    type="button"
                    title={drawingColor.label}
                    aria-label={drawingColor.label}
                    aria-pressed={color === drawingColor.value}
                    onClick={() => setColor(drawingColor.value)}
                    className={`h-8 w-8 rounded-full border-2 transition-transform ${
                      color === drawingColor.value ? "border-white scale-110" : "border-gray-600"
                    }`}
                    style={{ backgroundColor: drawingColor.value }}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Pen size</p>
              <div className="flex gap-2" role="group" aria-label="Pen size">
                {DRAWING_WIDTHS.map((drawingWidth) => (
                  <button
                    key={drawingWidth.value}
                    type="button"
                    aria-pressed={strokeWidth === drawingWidth.value}
                    onClick={() => setStrokeWidth(drawingWidth.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      strokeWidth === drawingWidth.value
                        ? "border-emerald-500 bg-emerald-900/40 text-white"
                        : "border-gray-700 bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {drawingWidth.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm">
            {hasCurrentStroke ? "Your mark is complete. Pass the device to the next player." : "Press and drag once anywhere on the board."}
          </p>
        </>
      ) : (
        <div className="rounded-xl border border-emerald-900/70 bg-emerald-950/30 p-6 text-center">
          <p className="text-lg font-medium text-emerald-100">Draw one thing on the shared paper or whiteboard.</p>
          <p className="text-sm text-emerald-200/70 mt-2">Keep your word private, then mark your turn complete below.</p>
        </div>
      )}

      <button
        onClick={handleDone}
        disabled={isBrowserBoard && !hasCurrentStroke}
        className={`self-center font-semibold py-3 px-10 rounded-lg text-lg transition-colors ${
          !isBrowserBoard || hasCurrentStroke
            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
            : "bg-gray-700 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isBrowserBoard ? "Finish my mark" : "I added my mark"}
      </button>
    </main>
  );
}
