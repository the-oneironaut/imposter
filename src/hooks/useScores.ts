"use client";

import { useState, useEffect, useCallback } from "react";
import type { PlayerScore, Round } from "@/lib/types";
import { getScores, getRounds } from "@/lib/storage";

export function useScores() {
  const [scores, setScores] = useState<Record<string, PlayerScore>>({});
  const [rounds, setRounds] = useState<Round[]>([]);

  const refresh = useCallback(() => {
    setScores(getScores());
    setRounds(getRounds());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { scores, rounds, refresh };
}
