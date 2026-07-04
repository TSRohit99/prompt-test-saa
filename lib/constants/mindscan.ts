export const MINDSCAN_QUESTION_COUNT = 6;

export const MINDSCAN_QUESTION_OPENAI_OPTIONS = {
  max_tokens: 2200,
  temperature: 0.6,
  retries: 2,
  backoffMs: 800,
  response_format: { type: "json_object" as const },
};

export const DEFAULT_OPENAI_OPTIONS = {
  max_tokens: 4500,
  temperature: 0.8,
  retries: 5,
  backoffMs: 1000,
};

export const SHADOW_OPENAI_OPTIONS = {
  ...DEFAULT_OPENAI_OPTIONS,
  response_format: { type: "json_object" as const },
};
