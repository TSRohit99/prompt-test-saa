"use client";

interface PromptEditorProps {
  systemPrompt: string;
  userPrompt: string;
  onSystemChange: (v: string) => void;
  onUserChange: (v: string) => void;
  onReset: () => void;
  onCopy: () => void;
  headerExtra?: React.ReactNode;
}

export function PromptEditor({
  systemPrompt,
  userPrompt,
  onSystemChange,
  onUserChange,
  onReset,
  onCopy,
  headerExtra,
}: PromptEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Prompts</h2>
        <div className="flex items-center gap-2">
          {headerExtra}
          <button
            type="button"
            onClick={onCopy}
            className="rounded border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700"
          >
            Reset defaults
          </button>
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-500">System prompt</span>
        <textarea
          value={systemPrompt}
          onChange={(e) => onSystemChange(e.target.value)}
          rows={12}
          className="w-full resize-y rounded-md border border-zinc-300 bg-zinc-50 p-2 font-mono text-xs leading-relaxed dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-500">User prompt</span>
        <textarea
          value={userPrompt}
          onChange={(e) => onUserChange(e.target.value)}
          rows={12}
          className="w-full resize-y rounded-md border border-zinc-300 bg-zinc-50 p-2 font-mono text-xs leading-relaxed dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
    </div>
  );
}
