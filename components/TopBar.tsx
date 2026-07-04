"use client";

import { CHAT_MODELS } from "@/lib/openai/models";
import { formatCost } from "@/lib/openai/pricing";

interface TopBarProps {
  apiKey: string;
  model: string;
  sessionCost: number;
  onApiKeyChange: (key: string) => void;
  onApiKeySave: () => void;
  onModelChange: (model: string) => void;
  onResetCost: () => void;
}

export function TopBar({
  apiKey,
  model,
  sessionCost,
  onApiKeyChange,
  onApiKeySave,
  onModelChange,
  onResetCost,
}: TopBarProps) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex min-w-[240px] flex-1 items-center gap-2">
        <label className="sr-only" htmlFor="api-key">
          OpenAI API Key
        </label>
        <input
          id="api-key"
          type="password"
          placeholder="OpenAI API key (Enter to save)"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onApiKeySave()}
          className="flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="button"
          onClick={onApiKeySave}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Save
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="model" className="text-xs text-zinc-500">
          Model
        </label>
        <select
          id="model"
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {CHAT_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">Session:</span>
        <span className="font-mono font-medium">{formatCost(sessionCost)}</span>
        <button
          type="button"
          onClick={onResetCost}
          className="text-xs text-zinc-500 underline"
        >
          reset
        </button>
      </div>
    </header>
  );
}
