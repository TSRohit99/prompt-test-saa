/** Per-million-token rates (USD). Update as OpenAI pricing changes. */
const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4.1": { input: 2.0, output: 8.0 },
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
  "gpt-4.1-nano": { input: 0.1, output: 0.4 },
  "o4-mini": { input: 1.1, output: 4.4 },
  "o3": { input: 10.0, output: 40.0 },
  "o3-mini": { input: 1.1, output: 4.4 },
  "gpt-5": { input: 1.25, output: 10.0 },
  "gpt-5-mini": { input: 0.25, output: 2.0 },
};

const FALLBACK = { input: 1.0, output: 3.0 };

export function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const rates = PRICING[model] ?? FALLBACK;
  return (
    (promptTokens / 1_000_000) * rates.input +
    (completionTokens / 1_000_000) * rates.output
  );
}

export function formatCost(cost: number): string {
  if (cost < 0.0001) return "< $0.0001";
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(4)}`;
}
