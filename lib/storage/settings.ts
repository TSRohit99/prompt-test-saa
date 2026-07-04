const KEYS = {
  API_KEY: "alpago_api_key",
  MODEL: "alpago_model",
  MODE: "alpago_mode",
  SESSION_COST: "alpago_session_cost",
} as const;

export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEYS.API_KEY) ?? "";
}

export function setApiKey(key: string): void {
  localStorage.setItem(KEYS.API_KEY, key);
}

export function getModel(): string {
  if (typeof window === "undefined") return "gpt-4o-mini";
  return localStorage.getItem(KEYS.MODEL) ?? "gpt-4o-mini";
}

export function setModel(model: string): void {
  localStorage.setItem(KEYS.MODEL, model);
}

export function getStoredMode(): string {
  if (typeof window === "undefined") return "questions";
  return localStorage.getItem(KEYS.MODE) ?? "questions";
}

export function setStoredMode(mode: string): void {
  localStorage.setItem(KEYS.MODE, mode);
}

export function getSessionCost(): number {
  if (typeof window === "undefined") return 0;
  return parseFloat(localStorage.getItem(KEYS.SESSION_COST) ?? "0") || 0;
}

export function addSessionCost(amount: number): number {
  const total = getSessionCost() + amount;
  localStorage.setItem(KEYS.SESSION_COST, String(total));
  return total;
}

export function resetSessionCost(): void {
  localStorage.setItem(KEYS.SESSION_COST, "0");
}
