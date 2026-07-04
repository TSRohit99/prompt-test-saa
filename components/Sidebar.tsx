"use client";

import type { PromptMode } from "@/lib/types";

const MODES: { id: PromptMode; label: string; description: string }[] = [
  {
    id: "chat",
    label: "Chat Prompt",
    description: "messageResponse flow with rolling summary",
  },
  {
    id: "questions",
    label: "Questions Generation",
    description: "generateQuestions by category",
  },
  {
    id: "analyze",
    label: "Analyze Answers",
    description: "belief detector + mirror (parallel)",
  },
  {
    id: "shadow",
    label: "Shadow Analysis",
    description: "analyzeShadow with MindScan context",
  },
];

interface SidebarProps {
  mode: PromptMode;
  onModeChange: (mode: PromptMode) => void;
  onExport: () => void;
  onImport: () => void;
  onClearData: () => void;
}

export function Sidebar({
  mode,
  onModeChange,
  onExport,
  onImport,
  onClearData,
}: SidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-4 py-5 dark:border-zinc-800">
        <h1 className="text-lg font-semibold tracking-tight">Alpago GPT</h1>
        <p className="mt-1 text-xs text-zinc-500">Prompt testing console</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onModeChange(m.id)}
            className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
              mode === m.id
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-700 hover:bg-zinc-200/70 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            <div className="text-sm font-medium">{m.label}</div>
            <div
              className={`mt-0.5 text-xs ${
                mode === m.id
                  ? "text-zinc-300 dark:text-zinc-600"
                  : "text-zinc-500"
              }`}
            >
              {m.description}
            </div>
          </button>
        ))}
      </nav>

      <div className="space-y-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={onExport}
          className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Export session
        </button>
        <button
          type="button"
          onClick={onImport}
          className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Import session
        </button>
        <button
          type="button"
          onClick={onClearData}
          className="w-full rounded-md border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
        >
          Clear all data
        </button>
      </div>
    </aside>
  );
}
