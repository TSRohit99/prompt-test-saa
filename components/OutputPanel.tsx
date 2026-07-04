"use client";

import { formatCost } from "@/lib/openai/pricing";
import type { RunHistoryEntry } from "@/lib/types";

interface OutputPanelProps {
  loading: boolean;
  error: string | null;
  latestResponse: string | null;
  runs: RunHistoryEntry[];
  onDeleteRun: (id: number) => void;
  onTogglePin: (entry: RunHistoryEntry) => void;
}

function tryPrettyJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

export function OutputPanel({
  loading,
  error,
  latestResponse,
  runs,
  onDeleteRun,
  onTogglePin,
}: OutputPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">Output</h2>

      {loading && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
          Calling OpenAI…
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {latestResponse && (
        <pre className="max-h-80 overflow-auto rounded-md border border-zinc-300 bg-zinc-50 p-3 font-mono text-xs whitespace-pre-wrap dark:border-zinc-700 dark:bg-zinc-900">
          {tryPrettyJson(latestResponse)}
        </pre>
      )}

      <div className="mt-2">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Call log
        </h3>
        {runs.length === 0 ? (
          <p className="text-xs text-zinc-500">No calls yet.</p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-auto">
            {runs.map((run) => (
              <div
                key={run.id ?? run.timestamp}
                className={`group rounded-md border p-2 text-xs ${
                  run.pinned
                    ? "border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-start gap-2">
                  <details className="min-w-0 flex-1">
                    <summary className="cursor-pointer list-none font-medium [&::-webkit-details-marker]:hidden">
                      {run.pinned && (
                        <span className="mr-1 text-amber-600 dark:text-amber-400">
                          Pinned ·
                        </span>
                      )}
                      {run.label} · {run.model} · {formatCost(run.cost)} · Input{" "}
                      {run.prompt_tokens.toLocaleString()} tokens / Output{" "}
                      {run.completion_tokens.toLocaleString()} tokens ·{" "}
                      {run.latencyMs}ms
                    </summary>
                    <div className="mt-2 space-y-2 text-zinc-600 dark:text-zinc-400">
                      <div>
                        <div className="font-medium text-zinc-500">System</div>
                        <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap">
                          {run.systemPrompt.slice(0, 500)}
                          {run.systemPrompt.length > 500 ? "…" : ""}
                        </pre>
                      </div>
                      <div>
                        <div className="font-medium text-zinc-500">User</div>
                        <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap">
                          {run.userPrompt.slice(0, 500)}
                          {run.userPrompt.length > 500 ? "…" : ""}
                        </pre>
                      </div>
                      <div>
                        <div className="font-medium text-zinc-500">Response</div>
                        <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap">
                          {run.response.slice(0, 500)}
                          {run.response.length > 500 ? "…" : ""}
                        </pre>
                      </div>
                    </div>
                  </details>

                  {run.id != null && (
                    <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        title={run.pinned ? "Unpin" : "Pin"}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onTogglePin(run);
                        }}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          run.pinned
                            ? "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                            : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {run.pinned ? "Unpin" : "Pin"}
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDeleteRun(run.id!);
                        }}
                        className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
