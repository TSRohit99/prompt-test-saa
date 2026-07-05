/** Format beliefs array into a readable string for AI prompts */
export function formatBeliefsForPrompt(beliefs: unknown): string | null {
  if (!Array.isArray(beliefs) || beliefs.length === 0) return null;

  const formatted = beliefs
    .filter((b) => b?.belief)
    .map((b) => {
      const line = b.category
        ? `- ${b.category}: "${b.belief}" (intensity ${b.intensity ?? 0})`
        : `- "${b.belief}" (intensity ${b.intensity ?? 0})`;
      if (b.improvement?.percentage != null) {
        return `${line}\n  improvement: ${b.improvement.percentage}%`;
      }
      return line;
    })
    .join("\n");

  return formatted || null;
}

/** Format tag objects or strings into a comma-separated list */
export function formatTagsForPrompt(tags: unknown): string | null {
  if (tags == null) return null;
  if (typeof tags === "string") return tags.trim() || null;
  if (Array.isArray(tags)) {
    const formatted = tags
      .map((t) => (typeof t === "string" ? t : t?.text))
      .filter(Boolean)
      .join(", ");
    return formatted || null;
  }
  return null;
}

/** Format category strings into a readable list */
export function formatCategoriesForPrompt(categories: unknown): string | null {
  if (categories == null) return null;
  if (typeof categories === "string") return categories.trim() || null;
  if (Array.isArray(categories)) {
    const formatted = categories
      .map((c) =>
        typeof c === "string" ? c : c?.text || c?.category
      )
      .filter(Boolean)
      .join(", ");
    return formatted || null;
  }
  return null;
}

/** Format chat context (string, message array, or other objects) for prompts */
export function formatContextForPrompt(context: unknown): string | null {
  if (context == null || context === "") return null;
  if (typeof context === "string") return context;

  if (Array.isArray(context)) {
    if (context.length === 0) return null;
    if (context[0]?.role != null && context[0]?.content != null) {
      return context.map((m) => `${m.role}: ${m.content}`).join("\n");
    }
    return JSON.stringify(context, null, 2);
  }

  if (typeof context === "object") {
    return JSON.stringify(context, null, 2);
  }

  return String(context);
}

/** Serialize MindScan answers for belief-detector JSON input */
export function formatAnswersForBeliefDetector(answers: unknown): string {
  return JSON.stringify(answers ?? [], null, 2);
}

/** Serialize categories for belief-detector JSON input */
export function formatCategoriesForBeliefDetector(categories: unknown): string {
  return JSON.stringify(categories ?? [], null, 2);
}
