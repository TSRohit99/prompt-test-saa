/**
 * Normalize Guru chat replies to plain text.
 * Handles occasional JSON echoes, markdown fences, or wrapped quotes.
 */
export function sanitizeChatResponse(raw: string | null | undefined): string {
  if (raw == null) return "";
  if (typeof raw !== "string") return String(raw);

  let text = raw.trim();
  if (!text) return text;

  const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  if (text.startsWith("{")) {
    try {
      const parsed = JSON.parse(text) as { content?: string; message?: string };
      if (typeof parsed?.content === "string" && parsed.content.trim()) {
        return parsed.content.trim();
      }
      if (typeof parsed?.message === "string" && parsed.message.trim()) {
        return parsed.message.trim();
      }
    } catch {
      // Not JSON — return cleaned plain text below.
    }
  }

  return text.replace(/^\s*["']|["']\s*$/g, "");
}
