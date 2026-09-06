"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlayers } from "@/hooks/usePlayers";
import { useItems } from "@/hooks/useItems";
import { useGame } from "@/context/GameContext";
import { LIMITS } from "@/lib/constants";
import { assignImposters, selectItem, selectDecoyItem, selectDifferentCategoryItem } from "@/lib/game-logic";
import { DRAWING_ITEMS } from "@/lib/drawing-items";
import { getUsedItemIds, setUsedItemIds, getPlayers, getDisabledCategories, setDisabledCategories, getLastRoundSettings, setLastRoundSettings } from "@/lib/storage";
import { shuffleArray } from "@/lib/random";
import type { DrawingMedium, GameMode } from "@/lib/types";

export default function SetupPage() {
  const router = useRouter();
  const { players, addPlayer, removePlayer } = usePlayers();
  const { items, usedItemIds, availableCount } = useItems();
  const { dispatch } = useGame();

  const [newPlayerName, setNewPlayerName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [imposterCount, setImposterCount] = useState(1);
  const [error, setError] = useState("");
  const [disabledCategories, setDisabledCategoriesState] = useState<string[]>([]);
  const [imposterWordMode, setImposterWordMode] = useState(false);
  const [decoySameCategory, setDecoySameCategory] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>("verbal");
  const [drawingMedium, setDrawingMedium] = useState<DrawingMedium>("browser");
  const [hasLastSettings, setHasLastSettings] = useState(false);

  const promptItems = gameMode === "drawing" ? DRAWING_ITEMS : items;
  const allCategories = Array.from(new Set(promptItems.map((i) => i.category || "Custom"))).sort();

  useEffect(() => {
    setDisabledCategoriesState(getDisabledCategories());
    if (getLastRoundSettings()) setHasLastSettings(true);
  }, []);

  const toggleCategory = (cat: string) => {
    setDisabledCategoriesState((prev) => {
      const next = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat];
      setDisabledCategories(next);
      return next;
    });
  };

  // Items eligible for this round (enabled category + not used)
  const poolItems = promptItems.filter((i) => !disabledCategories.includes(i.category || "Custom"));
  const poolAvailable = poolItems.filter((i) => !usedItemIds.includes(i.id));

  const maxImposters = Math.max(1, Math.floor((selectedIds.size - 1) / 2));

  useEffect(() => {
    if (imposterCount > maxImposters) {
      setImposterCount(maxImposters);
    }
  }, [selectedIds.size, maxImposters, imposterCount]);

  const togglePlayer = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim().length > LIMITS.MAX_PLAYER_NAME) {
      setError(`Max ${LIMITS.MAX_PLAYER_NAME} characters`);
      return;
    }
    const success = addPlayer(newPlayerName);
    if (success) {
      const trimmedName = newPlayerName.trim();
      setNewPlayerName("");
      setError("");
      // Auto-select newly added player
      setTimeout(() => {
        const allPlayers = getPlayers();
        const newPlayer = allPlayers.find(
          (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (newPlayer) {
          setSelectedIds((prev) => new Set([...prev, newPlayer.id]));
        }
      }, 0);
    } else {
      setError(newPlayerName.trim() ? "Player already exists" : "Enter a name");
    }
  };

  const minPlayers = imposterCount + 2;
  const canStart =
    selectedIds.size >= minPlayers &&
    poolAvailable.length >= 1 &&
    poolItems.length >= 2;

  const handleStart = () => {
    try {
      const currentUsedIds = getUsedItemIds();
      const playerIds = shuffleArray(Array.from(selectedIds));
      const drawingPlayerIds = shuffleArray(playerIds);

      const actualItem = selectItem(poolItems, currentUsedIds);
      const decoyItemId =
        gameMode === "drawing"
          ? (decoySameCategory
            ? selectDecoyItem(poolItems, actualItem.id, true, currentUsedIds)
            : selectDifferentCategoryItem(poolItems, actualItem.id, currentUsedIds)
          ).id
          : imposterWordMode
            ? null
            : selectDecoyItem(items, actualItem.id, decoySameCategory, currentUsedIds).id;
      const imposterIds = assignImposters(playerIds, imposterCount);

      // Persist settings so "Last Round" can restore them next time
      setLastRoundSettings({
        playerIds,
        imposterCount,
        disabledCategories,
        imposterWordMode: gameMode === "drawing" ? false : imposterWordMode,
        decoySameCategory,
        gameMode,
        drawingMedium,
      });

      // Mark item as used
      setUsedItemIds([
        ...new Set([
          ...currentUsedIds,
          actualItem.id,
          ...(decoyItemId ? [decoyItemId] : []),
        ]),
      ]);

      dispatch({
        type: "START_ROUND",
        playerIds,
        drawingPlayerIds,
        imposterCount,
        imposterIds,
        actualItemId: actualItem.id,
        decoyItemId,
        imposterWordMode: gameMode === "drawing" ? false : imposterWordMode,
        decoySameCategory,
        gameMode,
        drawingMedium,
      });

      router.push("/play/turn");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start round");
    }
  };

  const handleLoadLastSettings = () => {
    const last = getLastRoundSettings();
    if (!last) return;
    const currentPlayers = getPlayers();
    const validIds = last.playerIds.filter((id) => currentPlayers.some((p) => p.id === id));
    setSelectedIds(new Set(validIds));
    setImposterCount(last.imposterCount);
    setImposterWordMode(last.gameMode === "drawing" ? false : last.imposterWordMode);
    setDecoySameCategory(last.decoySameCategory);
    setGameMode(last.gameMode ?? "verbal");
    setDrawingMedium(last.drawingMedium ?? "browser");
    setDisabledCategoriesState(last.disabledCategories);
    setDisabledCategories(last.disabledCategories);
  };

  return (
    <main className="flex-1 flex flex-col p-6 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Round Setup</h1>
        <div className="flex items-center gap-2">
          {hasLastSettings && (
            <button
              type="button"
              onClick={handleLoadLastSettings}
              className="text-indigo-400 hover:text-indigo-300 text-xs border border-indigo-800 hover:border-indigo-600 px-2 py-1 rounded transition-colors"
            >
              Last Round
            </button>
          )}
          <button onClick={() => router.push("/")} className="text-gray-400 hover:text-white text-sm">
            ← Home
          </button>
        </div>
      </div>

      <form onSubmit={handleAddPlayer} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          placeholder="Add new player..."
          maxLength={LIMITS.MAX_PLAYER_NAME}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-400 mb-2">Game Mode</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setGameMode("verbal")}
            className={`p-3 rounded-lg border text-left transition-colors ${
              gameMode === "verbal"
                ? "bg-indigo-900/40 border-indigo-600"
                : "bg-gray-800 border-gray-700 hover:border-gray-600"
            }`}
          >
            <span className="block font-medium">Verbal discussion</span>
            <span className="block text-xs text-gray-500 mt-1">Talk, then vote</span>
          </button>
          <button
            type="button"
            onClick={() => setGameMode("drawing")}
            className={`p-3 rounded-lg border text-left transition-colors ${
              gameMode === "drawing"
                ? "bg-emerald-900/40 border-emerald-600"
                : "bg-gray-800 border-gray-700 hover:border-gray-600"
            }`}
          >
            <span className="block font-medium">Draw together</span>
            <span className="block text-xs text-gray-500 mt-1">Build one shared clue</span>
          </button>
        </div>
      </div>

      <h2 className="text-sm font-medium text-gray-400 mb-2">
        Select players ({selectedIds.size} selected)
      </h2>

      <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
        {players.length === 0 && (
          <p className="text-gray-500 text-center py-4">No players yet. Add some above.</p>
        )}
        {players.map((player) => (
          <label
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
              selectedIds.has(player.id)
                ? "bg-indigo-900/50 border border-indigo-600"
                : "bg-gray-800 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.has(player.id)}
                onChange={() => togglePlayer(player.id)}
                className="rounded accent-indigo-500"
              />
              <span>{player.name}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                removePlayer(player.id);
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  next.delete(player.id);
                  return next;
                });
              }}
              className="text-red-400 hover:text-red-300 text-xs transition-colors"
            >
              ✕
            </button>
          </label>
        ))}
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-400 mb-2 block">
          Number of Imposters
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setImposterCount((c) => Math.max(1, c - 1))}
            className="bg-gray-800 hover:bg-gray-700 w-10 h-10 rounded-lg text-lg transition-colors"
          >
            −
          </button>
          <span className="text-xl font-bold w-8 text-center">{imposterCount}</span>
          <button
            onClick={() => setImposterCount((c) => Math.min(maxImposters, c + 1))}
            className="bg-gray-800 hover:bg-gray-700 w-10 h-10 rounded-lg text-lg transition-colors"
          >
            +
          </button>
          <span className="text-sm text-gray-500">max {maxImposters}</span>
        </div>
      </div>

      {gameMode === "verbal" ? (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-400 mb-2">Imposter Word</p>
        <button
          type="button"
          onClick={() => setImposterWordMode((v) => !v)}
          className={`flex items-center gap-3 p-3 rounded-lg border w-full transition-colors ${
            imposterWordMode
              ? "bg-red-900/30 border-red-700"
              : "bg-gray-800 border-gray-700"
          }`}
        >
          <div
            className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors ${
              imposterWordMode ? "bg-red-600" : "bg-gray-600"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                imposterWordMode ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">
              {imposterWordMode ? 'Imposter sees “Imposter”' : "Imposter sees a decoy word"}
            </p>
            <p className="text-xs text-gray-500">
              {imposterWordMode
                ? "No decoy — imposter knows their role immediately"
                : "Imposter gets a random different word to blend in"}
            </p>
          </div>
        </button>
        </div>
      ) : (
        <div className="mb-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-2">Drawing surface</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDrawingMedium("browser")}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  drawingMedium === "browser"
                    ? "bg-emerald-900/40 border-emerald-600"
                    : "bg-gray-800 border-gray-700 hover:border-gray-600"
                }`}
              >
                <span className="block font-medium">Browser board</span>
                <span className="block text-xs text-gray-500 mt-1">Draw on this device</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawingMedium("physical")}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  drawingMedium === "physical"
                    ? "bg-emerald-900/40 border-emerald-600"
                    : "bg-gray-800 border-gray-700 hover:border-gray-600"
                }`}
              >
                <span className="block font-medium">Paper or board</span>
                <span className="block text-xs text-gray-500 mt-1">Use a physical surface</span>
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-900/70 bg-emerald-950/30 p-3 text-sm text-emerald-100">
            {drawingMedium === "browser"
              ? "Everyone uses one shared board on this device. Pass it after each person adds one mark."
              : "Use one shared whiteboard or sheet of paper. The app shows each private word and tracks whose turn it is; pass the device only for the turn controls."
            }
          </div>

          <div>
            <p className="text-sm font-medium text-gray-400 mb-2">Imposter prompt relationship</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDecoySameCategory(true)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  decoySameCategory
                    ? "bg-amber-900/40 border-amber-600"
                    : "bg-gray-800 border-gray-700 hover:border-gray-600"
                }`}
              >
                <span className="block font-medium">Related</span>
                <span className="block text-xs text-gray-500 mt-1">Same category</span>
              </button>
              <button
                type="button"
                onClick={() => setDecoySameCategory(false)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  !decoySameCategory
                    ? "bg-amber-900/40 border-amber-600"
                    : "bg-gray-800 border-gray-700 hover:border-gray-600"
                }`}
              >
                <span className="block font-medium">Unrelated</span>
                <span className="block text-xs text-gray-500 mt-1">Any other category</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {gameMode === "verbal" && !imposterWordMode && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-400 mb-2">Decoy Word Category</p>
          <button
            type="button"
            onClick={() => setDecoySameCategory((v) => !v)}
            className={`flex items-center gap-3 p-3 rounded-lg border w-full transition-colors ${
              decoySameCategory
                ? "bg-indigo-900/30 border-indigo-700"
                : "bg-gray-800 border-gray-700"
            }`}
          >
            <div
              className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors ${
                decoySameCategory ? "bg-indigo-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  decoySameCategory ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">
                {decoySameCategory ? "Same category" : "Any category"}
              </p>
              <p className="text-xs text-gray-500">
                {decoySameCategory
                  ? "Pick another word from the real word's category"
                  : "Pick any other word from all categories"}
              </p>
            </div>
          </button>
        </div>
      )}

      {(gameMode === "verbal" ? availableCount : poolAvailable.length) <= 0 && (
        <p className="text-yellow-400 text-sm mb-3">
          {gameMode === "drawing"
            ? "All drawable prompts have been used. Reset used items to continue."
            : "No items available! Go to Manage Items to add more or reset used items."
          }
        </p>
      )}

      {poolAvailable.length === 0 && poolItems.length > 0 && (
        <p className="text-yellow-400 text-sm mb-3">
          All items in selected categories have been used. Reset used items or enable more categories.
        </p>
      )}

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-400 mb-2">
          {gameMode === "drawing" ? "Drawing Categories" : "Word Categories"}
          <span className="text-gray-600 ml-2">
            ({poolAvailable.length} available from {poolItems.length} {gameMode === "drawing" ? "prompts" : "items"})
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => {
            const enabled = !disabledCategories.includes(cat);
            const catItems = promptItems.filter((i) => (i.category || "Custom") === cat);
            const catAvailable = catItems.filter((i) => !usedItemIds.includes(i.id)).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  enabled
                    ? "bg-indigo-700/60 border-indigo-500 text-white"
                    : "bg-gray-800 border-gray-600 text-gray-500"
                }`}
              >
                {cat}
                <span className={`ml-1.5 text-xs ${enabled ? "text-indigo-300" : "text-gray-600"}`}>
                  {catAvailable}/{catItems.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!canStart}
        className={`w-full py-3 rounded-lg font-semibold text-lg transition-colors ${
          canStart
            ? "bg-green-600 hover:bg-green-500"
            : "bg-gray-700 text-gray-500 cursor-not-allowed"
        }`}
      >
        Start Round
      </button>

      {!canStart && selectedIds.size > 0 && selectedIds.size < minPlayers && (
        <p className="text-gray-500 text-sm mt-2 text-center">
          Need at least {minPlayers} players for {imposterCount} imposter{imposterCount > 1 ? "s" : ""}
        </p>
      )}
    </main>
  );
}
