import { createServerFn } from "@tanstack/react-start";
import { DIRECT_SOURCES, type DirectSource, type QueryIntent } from "./types";

function normalizeQuery(raw: unknown): string {
  return String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, 280);
}

function sanitizeIntent(raw: unknown): QueryIntent | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const row = raw as Record<string, unknown>;
  const topic = String(row.topic ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
  const clean = (value: unknown, maxItems: number, maxLen: number) => {
    if (!Array.isArray(value)) return [];
    const out: string[] = [];
    const seen = new Set<string>();
    for (const item of value) {
      const text = String(item ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLen);
      if (text.length < 3) continue;
      const key = text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(text);
      if (out.length >= maxItems) break;
    }
    return out;
  };
  const searches = clean(row.searches, 4, 80);
  const related = clean(row.related, 8, 48);
  if (!topic && !searches.length && !related.length) return undefined;
  return { topic, searches, related };
}

export const expandChorusQuery = createServerFn({ method: "POST" })
  .validator((input: { query: string }) => {
    const query = normalizeQuery(input?.query);
    if (query.length < 3) throw new Error("Ask a slightly longer question.");
    return { query };
  })
  .handler(async ({ data }) => {
    const { expandQuery } = await import("./expand.server");
    return expandQuery(data.query);
  });

export const fetchChorusSource = createServerFn({ method: "POST" })
  .validator((input: { query: string; source: DirectSource; intent?: QueryIntent }) => {
    const query = normalizeQuery(input?.query);
    const source = input?.source;
    if (query.length < 3) throw new Error("Ask a slightly longer question.");
    if (!DIRECT_SOURCES.includes(source)) throw new Error("Unknown source.");
    return { query, source, intent: sanitizeIntent(input?.intent) };
  })
  .handler(async ({ data }) => {
    const { fetchSource } = await import("./sources.server");
    return fetchSource(data.source, data.query, data.intent);
  });

export const composeChorusPulse = createServerFn({ method: "POST" })
  .validator((input: { query: string; comments: unknown; intent?: QueryIntent }) => {
    const query = normalizeQuery(input?.query);
    if (query.length < 3) throw new Error("Ask a slightly longer question.");
    const comments = Array.isArray(input?.comments) ? input.comments : [];
    return { query, comments: comments.slice(0, 60), intent: sanitizeIntent(input?.intent) };
  })
  .handler(async ({ data }) => {
    const { composePulse } = await import("./pulse.server");
    const comments = data.comments.filter(
      (row) => row && typeof row === "object" && "text" in row && "source" in row,
    ) as Parameters<typeof composePulse>[1];
    return composePulse(data.query, comments, data.intent);
  });
