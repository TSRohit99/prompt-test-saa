import type { Belief } from "@/lib/types";

export function formatBeliefsForPrompt(beliefs: Belief[] | unknown): string {
  if (!Array.isArray(beliefs) || beliefs.length === 0) return "None";
  return (beliefs as Belief[])
    .filter((b) => b.category)
    .map((b) => `- ${b.category}: "${b.belief}" (intensity ${b.intensity})`)
    .join("\n");
}

export function formatBeliefsForShadow(beliefs: Belief[] | unknown): string {
  if (!Array.isArray(beliefs) || beliefs.length === 0) return "Not provided";
  return (beliefs as Belief[])
    .filter((b) => b.belief)
    .map((b) => {
      const parts = [`- "${b.belief}" (intensity ${b.intensity ?? 0})`];
      if (b.category)
        parts[0] = `- ${b.category}: "${b.belief}" (intensity ${b.intensity ?? 0})`;
      if (b.improvement?.percentage != null) {
        parts.push(`  improvement: ${b.improvement.percentage}%`);
      }
      return parts.join("\n");
    })
    .join("\n");
}
