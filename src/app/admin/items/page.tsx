"use client";

import { useState } from "react";
import Link from "next/link";
import { useItems } from "@/hooks/useItems";
import { LIMITS } from "@/lib/constants";

export default function ItemManagerPage() {
  const { items, usedItemIds, addItem, removeItem, resetUsedItems, loadDefaults, availableCount } = useItems();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loadMsg, setLoadMsg] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length > LIMITS.MAX_ITEM_TEXT) {
      setError(`Max ${LIMITS.MAX_ITEM_TEXT} characters`);
      return;
    }
    const success = addItem(text);
    if (success) {
      setText("");
      setError("");
    } else {
      setError(text.trim() ? "Item already exists" : "Enter a word");
    }
  };

  return (
    <main className="flex-1 flex flex-col p-6 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Items</h1>
        <Link href="/" className="text-gray-400 hover:text-white text-sm">
          ← Home
        </Link>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a word or phrase..."
          maxLength={LIMITS.MAX_ITEM_TEXT}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
        <span>{availableCount} available / {items.length} total</span>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const count = loadDefaults();
              setLoadMsg(count > 0 ? `Added ${count} items` : "All defaults already loaded");
              setTimeout(() => setLoadMsg(""), 3000);
            }}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Load Defaults
          </button>
          {usedItemIds.length > 0 && (
            <button
              onClick={resetUsedItems}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Reset Used
            </button>
          )}
        </div>
      </div>

      {loadMsg && <p className="text-green-400 text-sm mb-3">{loadMsg}</p>}

      <div className="flex-1 overflow-y-auto space-y-4">
        {items.length === 0 && (
          <p className="text-gray-500 text-center py-8">No items yet. Add some words above.</p>
        )}
        {Array.from(new Set(items.map((i) => i.category || "Custom")))
          .sort()
          .map((category) => {
            const catItems = items.filter((i) => (i.category || "Custom") === category);
            const usedCount = catItems.filter((i) => usedItemIds.includes(i.id)).length;
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {category}
                  </h3>
                  <span className="text-xs text-gray-600">
                    {catItems.length - usedCount}/{catItems.length} available
                  </span>
                </div>
                <div className="space-y-1.5">
                  {catItems.map((item) => {
                    const isUsed = usedItemIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isUsed ? "bg-gray-900 text-gray-500" : "bg-gray-800"
                        }`}
                      >
                        <span className={isUsed ? "line-through" : ""}>{item.text}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300 text-sm transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </main>
  );
}
