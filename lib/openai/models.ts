export interface ModelCapabilities {
  /** Use max_completion_tokens instead of max_tokens */
  maxCompletionTokens: boolean;
  /** Whether a custom temperature value is accepted (reasoning models: default only) */
  customTemperature: boolean;
}

export interface ModelInfo extends ModelCapabilities {
  id: string;
  label: string;
}

/**
 * Per-model API constraints (Chat Completions).
 * Reasoning models (o*, gpt-5*) use max_completion_tokens and fixed temperature.
 * GPT-4.x / GPT-4o use max_tokens and custom temperature.
 */
export const CHAT_MODELS: ModelInfo[] = [
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    maxCompletionTokens: false,
    customTemperature: true,
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    maxCompletionTokens: false,
    customTemperature: true,
  },
  {
    id: "gpt-4.1",
    label: "GPT-4.1",
    maxCompletionTokens: false,
    customTemperature: true,
  },
  {
    id: "gpt-4.1-mini",
    label: "GPT-4.1 Mini",
    maxCompletionTokens: false,
    customTemperature: true,
  },
  {
    id: "gpt-4.1-nano",
    label: "GPT-4.1 Nano",
    maxCompletionTokens: false,
    customTemperature: true,
  },
  {
    id: "o4-mini",
    label: "o4-mini",
    maxCompletionTokens: true,
    customTemperature: false,
  },
  {
    id: "o3",
    label: "o3",
    maxCompletionTokens: true,
    customTemperature: false,
  },
  {
    id: "o3-mini",
    label: "o3-mini",
    maxCompletionTokens: true,
    customTemperature: false,
  },
  {
    id: "gpt-5",
    label: "GPT-5",
    maxCompletionTokens: true,
    customTemperature: false,
  },
  {
    id: "gpt-5-mini",
    label: "GPT-5 Mini",
    maxCompletionTokens: true,
    customTemperature: false,
  },
];

export const DEFAULT_MODEL = "gpt-4o-mini";

/** Match versioned snapshot ids e.g. o3-2025-04-16, gpt-5-mini-2025-08-07 */
function isReasoningModelId(model: string): boolean {
  return /^(o\d|gpt-5)/.test(model);
}

export function getModelCapabilities(model: string): ModelCapabilities {
  const known = CHAT_MODELS.find((m) => m.id === model);
  if (known) {
    return {
      maxCompletionTokens: known.maxCompletionTokens,
      customTemperature: known.customTemperature,
    };
  }
  const reasoning = isReasoningModelId(model);
  return {
    maxCompletionTokens: reasoning,
    customTemperature: !reasoning,
  };
}

export function usesMaxCompletionTokens(model: string): boolean {
  return getModelCapabilities(model).maxCompletionTokens;
}

export function supportsCustomTemperature(model: string): boolean {
  return getModelCapabilities(model).customTemperature;
}
