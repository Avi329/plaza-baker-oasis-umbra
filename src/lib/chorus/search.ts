import { createServerFn } from "@tanstack/react-start";
import { DIRECT_SOURCES, type DirectSource } from "./types";

function normalizeQuery(raw: unknown): string {
  return String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, 280);
}

export const fetchChorusSource = createServerFn({ method: "POST" })
  .validator((input: { query: string; source: DirectSource }) => {
    const query = normalizeQuery(input?.query);
    const source = input?.source;
    if (query.length < 3) throw new Error("Ask a slightly longer question.");
    if (!DIRECT_SOURCES.includes(source)) throw new Error("Unknown source.");
    return { query, source };
  })
  .handler(async ({ data }) => {
    const { fetchSource } = await import("./sources.server");
    return fetchSource(data.source, data.query);
  });

export const composeChorusPulse = createServerFn({ method: "POST" })
  .validator((input: { query: string; comments: unknown }) => {
    const query = normalizeQuery(input?.query);
    if (query.length < 3) throw new Error("Ask a slightly longer question.");
    const comments = Array.isArray(input?.comments) ? input.comments : [];
    return { query, comments: comments.slice(0, 36) };
  })
  .handler(async ({ data }) => {
    const { composePulse } = await import("./pulse.server");
    const comments = data.comments.filter(
      (row) => row && typeof row === "object" && "text" in row && "source" in row,
    ) as Parameters<typeof composePulse>[1];
    return composePulse(data.query, comments);
  });
