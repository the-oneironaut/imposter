"use client";

import { useState, useCallback, useEffect } from "react";
import { nanoid } from "nanoid";
import type { Item } from "@/lib/types";
import { getItems, setItems, getUsedItemIds, setUsedItemIds } from "@/lib/storage";
import { DEFAULT_ITEMS } from "@/lib/default-items";

// Module-level flag ensures seeding runs only once per session,
// even under React Strict Mode's double-mount behaviour.
let clientSeeded = false;

export function useItems() {
  // Always start with [] to match SSR output — avoids hydration mismatch
  // from the `typeof window` branch that Next.js warns about.
  const [items, setItemsState] = useState<Item[]>([]);
  const [usedItemIds, setUsedItemIdsState] = useState<string[]>([]);

  // Runs only on the client after hydration. Module-level flag prevents
  // double-execution under React Strict Mode's mount→unmount→remount cycle.
  useEffect(() => {
    if (clientSeeded) return;
    clientSeeded = true;

    setUsedItemIdsState(getUsedItemIds());

    let stored = getItems();
    if (stored.length === 0) {
      const now = new Date().toISOString();
      stored = DEFAULT_ITEMS.map((d) => ({
        id: nanoid(),
        text: d.text,
        category: d.category,
        createdAt: now,
      }));
      setItems(stored);
    } else {
      // Back-fill category for items created before the category field existed
      const needsUpdate = stored.some((i) => !i.category);
      if (needsUpdate) {
        const textToCategory = new Map(
          DEFAULT_ITEMS.map((d) => [d.text.toLowerCase(), d.category])
        );
        stored = stored.map((i) =>
          i.category
            ? i
            : { ...i, category: textToCategory.get(i.text.toLowerCase()) ?? "Custom" }
        );
        setItems(stored);
      }
    }
    setItemsState(stored);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addItem = useCallback((text: string, category = "Custom"): boolean => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    const current = getItems();
    const exists = current.some(
      (i) => i.text.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return false;
    const newItem: Item = {
      id: nanoid(),
      text: trimmed,
      category,
      createdAt: new Date().toISOString(),
    };
    const updated = [...current, newItem];
    setItems(updated);
    setItemsState(updated);
    return true;
  }, []);

  const removeItem = useCallback((id: string) => {
    const current = getItems();
    const updated = current.filter((i) => i.id !== id);
    setItems(updated);
    setItemsState(updated);
    const currentUsed = getUsedItemIds();
    const updatedUsed = currentUsed.filter((uid) => uid !== id);
    setUsedItemIds(updatedUsed);
    setUsedItemIdsState(updatedUsed);
  }, []);

  const resetUsedItems = useCallback(() => {
    setUsedItemIds([]);
    setUsedItemIdsState([]);
  }, []);

  const loadDefaults = useCallback(() => {
    const current = getItems();
    const existingTexts = new Set(current.map((i) => i.text.toLowerCase()));
    const now = new Date().toISOString();
    const newItems = DEFAULT_ITEMS.filter(
      (d) => !existingTexts.has(d.text.toLowerCase())
    ).map((d) => ({ id: nanoid(), text: d.text, category: d.category, createdAt: now }));

    const finalItems = newItems.length > 0 ? [...current, ...newItems] : current;
    if (newItems.length > 0) setItems(finalItems);
    // Always refresh state so UI reflects localStorage truth
    setItemsState([...finalItems]);
    return newItems.length;
  }, []);

  const availableCount = items.filter((i) => !usedItemIds.includes(i.id)).length;

  return { items, usedItemIds, addItem, removeItem, resetUsedItems, loadDefaults, availableCount };
}

