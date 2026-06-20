"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlayers } from "@/hooks/usePlayers";
import { useItems } from "@/hooks/useItems";
import { useGame } from "@/context/GameContext";
import { LIMITS } from "@/lib/constants";
import { assignImposters, selectItem, selectDecoyItem } from "@/lib/game-logic";
import { getItems, getUsedItemIds, setUsedItemIds, getPlayers } from "@/lib/storage";

export default function SetupPage() {
  const router = useRouter();
  const { players, addPlayer, removePlayer } = usePlayers();
  const { items, usedItemIds, availableCount } = useItems();
  const { dispatch } = useGame();

  const [newPlayerName, setNewPlayerName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [imposterCount, setImposterCount] = useState(1);
  const [error, setError] = useState("");

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
    availableCount >= 1 &&
    items.length >= 2;

  const handleStart = () => {
    try {
      const allItems = getItems();
      const currentUsedIds = getUsedItemIds();
      const playerIds = Array.from(selectedIds);

      const actualItem = selectItem(allItems, currentUsedIds);
      const decoyItem = selectDecoyItem(allItems, actualItem.id);
      const imposterIds = assignImposters(playerIds, imposterCount);

      // Mark item as used
      setUsedItemIds([...currentUsedIds, actualItem.id]);

      dispatch({
        type: "START_ROUND",
        playerIds,
        imposterCount,
        imposterIds,
        actualItemId: actualItem.id,
        decoyItemId: decoyItem.id,
      });

      router.push("/play/turn");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start round");
    }
  };

  return (
    <main className="flex-1 flex flex-col p-6 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Round Setup</h1>
        <button onClick={() => router.push("/")} className="text-gray-400 hover:text-white text-sm">
          ← Home
        </button>
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

      {availableCount <= 0 && (
        <p className="text-yellow-400 text-sm mb-3">
          No items available! Go to Manage Items to add more or reset used items.
        </p>
      )}

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
