import type { OpenAIOptions, PromptMode } from "@/lib/types";

export interface ModePromptSnapshot {
  systemPrompt: string;
  userPrompt: string;
  mirrorSystemPrompt: string;
  mirrorUserPrompt: string;
  analyzePromptTarget: "belief" | "mirror";
  dirty: { system: boolean; user: boolean };
  mirrorDirty: { system: boolean; user: boolean };
  defaultSystemPrompt: string;
  defaultUserPrompt: string;
  defaultMirrorSystemPrompt: string;
  defaultMirrorUserPrompt: string;
  openaiOptions: OpenAIOptions;
}

const STORAGE_KEY = "alpago_mode_prompts";

type StoredPrompts = Partial<Record<PromptMode, ModePromptSnapshot>>;

function readAll(): StoredPrompts {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPrompts) : {};
  } catch {
    return {};
  }
}

function writeAll(data: StoredPrompts): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getModePromptSnapshot(
  mode: PromptMode
): ModePromptSnapshot | null {
  return readAll()[mode] ?? null;
}

export function saveModePromptSnapshot(
  mode: PromptMode,
  snapshot: ModePromptSnapshot
): void {
  const all = readAll();
  all[mode] = snapshot;
  writeAll(all);
}

export function clearAllModePromptSnapshots(): void {
  localStorage.removeItem(STORAGE_KEY);
}
