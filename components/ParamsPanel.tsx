"use client";

import { getModelCapabilities } from "@/lib/openai/models";
import type { OpenAIOptions, PromptMode } from "@/lib/types";

interface OpenAIOptionsEditorProps {
  model: string;
  options: OpenAIOptions;
  onChange: (options: OpenAIOptions) => void;
  showJsonFormat?: boolean;
}

export function OpenAIOptionsEditor({
  model,
  options,
  onChange,
  showJsonFormat,
}: OpenAIOptionsEditorProps) {
  const caps = getModelCapabilities(model);
  const tokenLabel = caps.maxCompletionTokens
    ? "max_completion_tokens"
    : "max_tokens";

  return (
    <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
      <h3 className="mb-2 text-xs font-semibold uppercase text-zinc-500">
        OpenAI options
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs">
          {tokenLabel}
          <input
            type="number"
            value={options.max_tokens ?? 4500}
            onChange={(e) =>
              onChange({ ...options, max_tokens: Number(e.target.value) })
            }
            className="mt-0.5 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="text-xs">
          temperature
          <input
            type="number"
            step="0.1"
            value={options.temperature ?? 0.8}
            onChange={(e) =>
              onChange({ ...options, temperature: Number(e.target.value) })
            }
            disabled={!caps.customTemperature}
            title={
              caps.customTemperature
                ? undefined
                : "This model only supports the default temperature (1)"
            }
            className="mt-0.5 w-full rounded border border-zinc-300 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>
      {!caps.customTemperature && (
        <p className="mt-1 text-[10px] text-zinc-500">
          Temperature fixed at default for reasoning models.
        </p>
      )}
      {showJsonFormat && (
        <label className="mt-2 flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={options.response_format?.type === "json_object"}
            onChange={(e) =>
              onChange({
                ...options,
                response_format: e.target.checked
                  ? { type: "json_object" }
                  : undefined,
              })
            }
          />
          response_format: json_object
        </label>
      )}
    </div>
  );
}

interface ParamsPanelProps {
  mode: PromptMode;
  model: string;
  children: React.ReactNode;
  openaiOptions: OpenAIOptions;
  onOpenAIOptionsChange: (o: OpenAIOptions) => void;
  onSend: () => void;
  onLoadFixture: () => void;
  loading: boolean;
  sendLabel?: string;
}

export function ParamsPanel({
  mode,
  model,
  children,
  openaiOptions,
  onOpenAIOptionsChange,
  onSend,
  onLoadFixture,
  loading,
  sendLabel = "Send",
}: ParamsPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Parameters</h2>
        <button
          type="button"
          onClick={onLoadFixture}
          className="rounded border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700"
        >
          Load sample
        </button>
      </div>

      {children}

      <OpenAIOptionsEditor
        model={model}
        options={openaiOptions}
        onChange={onOpenAIOptionsChange}
        showJsonFormat={mode === "questions" || mode === "shadow"}
      />

      <button
        type="button"
        onClick={onSend}
        disabled={loading}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {loading ? "Sending…" : sendLabel}
      </button>
    </div>
  );
}
