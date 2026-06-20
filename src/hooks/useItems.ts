"use client";

import { useState, useEffect, useCallback } from "react";
import { nanoid } from "nanoid";
import type { Item } from "@/lib/types";
import { getItems, setItems, getUsedItemIds, setUsedItemIds } from "@/lib/storage";
import { DEFAULT_ITEMS } from "@/lib/default-items";

export function useItems() {
  const [items, setItemsState] = useState<Item[]>([]);
  const [usedItemIds, setUsedItemIdsState] = useState<string[]>([]);

  useEffect(() => {
    let current = getItems();
    if (current.length === 0) {
      const now = new Date().toISOString();
      current = DEFAULT_ITEMS.map((text) => ({
        id: nanoid(),
        text,
        createdAt: now,
      }));
      setItems(current);
    }
    setItemsState(current);
    setUsedItemIdsState(getUsedItemIds());
  }, []);

  const addItem = useCallback((text: string): boolean => {
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
    console.log("[loadDefaults] current items in localStorage:", current.length);
    console.log("[loadDefaults] DEFAULT_ITEMS count:", DEFAULT_ITEMS.length);
    const existingTexts = new Set(current.map((i) => i.text.toLowerCase()));
    const now = new Date().toISOString();
    const newItems = DEFAULT_ITEMS
      .filter((text) => !existingTexts.has(text.toLowerCase()))
      .map((text) => ({ id: nanoid(), text, createdAt: now }));
    console.log("[loadDefaults] new items to add:", newItems.length);
    if (newItems.length > 0) {
      const updated = [...current, ...newItems];
      setItems(updated);
      setItemsState(updated);
    }
    return newItems.length;
  }, []);

  const availableCount = items.filter((i) => !usedItemIds.includes(i.id)).length;

  return { items, usedItemIds, addItem, removeItem, resetUsedItems, loadDefaults, availableCount };
}
