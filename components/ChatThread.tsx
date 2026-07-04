"use client";

import { getNextSummaryAt } from "@/lib/context/chatContext";
import type { ChatMessage } from "@/lib/types";

interface ChatThreadProps {
  messages: ChatMessage[];
  msgCount: number;
  summaryId: number;
  summaryPreview: string;
}

export function ChatThread({
  messages,
  msgCount,
  summaryId,
  summaryPreview,
}: ChatThreadProps) {
  return (
    <div className="border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-zinc-500">
        <span>msgCount: {msgCount}</span>
        <span>summary id: {summaryId}</span>
        <span>next summary at user turn: {getNextSummaryAt(msgCount)}</span>
      </div>

      {summaryPreview && (
        <details className="mb-3 rounded-md border border-zinc-200 p-2 text-xs dark:border-zinc-800">
          <summary className="cursor-pointer font-medium">Current summary</summary>
          <p className="mt-2 whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
            {summaryPreview || "(empty)"}
          </p>
        </details>
      )}

      <div className="max-h-48 space-y-2 overflow-auto">
        {messages.map((m, i) => (
          <div
            key={`${m.timeStamp}-${i}`}
            className={`rounded-lg px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-8 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "mr-8 bg-white border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900"
            }`}
          >
            <div className="mb-0.5 text-xs font-medium opacity-60">
              {m.role === "user" ? "You" : "Guru"}
            </div>
            {m.content}
          </div>
        ))}
      </div>
    </div>
  );
}
