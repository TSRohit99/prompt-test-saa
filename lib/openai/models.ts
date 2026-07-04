export interface ModelInfo {
  id: string;
  label: string;
}

export const CHAT_MODELS: ModelInfo[] = [
  { id: "gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "gpt-4.1", label: "GPT-4.1" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
  { id: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
  { id: "o4-mini", label: "o4-mini" },
  { id: "o3", label: "o3" },
  { id: "o3-mini", label: "o3-mini" },
  { id: "gpt-5", label: "GPT-5" },
  { id: "gpt-5-mini", label: "GPT-5 Mini" },
];

export const DEFAULT_MODEL = "gpt-4o-mini";
