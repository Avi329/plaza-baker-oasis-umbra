const KEY = "chorus.recent-questions";
const LIMIT = 8;

export function readHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string").slice(0, LIMIT);
  } catch {
    return [];
  }
}

export function pushHistory(query: string): string[] {
  const next = [query, ...readHistory().filter((item) => item !== query)].slice(0, LIMIT);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}
