"use client";

import { useState, useEffect, useCallback } from "react";
import { nanoid } from "nanoid";
import type { Player } from "@/lib/types";
import { getPlayers, setPlayers } from "@/lib/storage";

export function usePlayers() {
  const [players, setPlayersState] = useState<Player[]>([]);

  useEffect(() => {
    setPlayersState(getPlayers());
  }, []);

  const addPlayer = useCallback((name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const current = getPlayers();
    const exists = current.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return false;
    const newPlayer: Player = {
      id: nanoid(),
      name: trimmed,
      createdAt: new Date().toISOString(),
    };
    const updated = [...current, newPlayer];
    setPlayers(updated);
    setPlayersState(updated);
    return true;
  }, []);

  const removePlayer = useCallback((id: string) => {
    const current = getPlayers();
    const updated = current.filter((p) => p.id !== id);
    setPlayers(updated);
    setPlayersState(updated);
  }, []);

  return { players, addPlayer, removePlayer };
}
