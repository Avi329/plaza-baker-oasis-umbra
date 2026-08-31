import { extractJson, grokComplete } from "./grok.server";
import { searchTerms } from "./text";
import type { QueryIntent } from "./types";

function clip(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function strings(raw: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const value = clip(item, maxLen);
    if (value.length < 3) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
    if (out.length >= maxItems) break;
  }
  return out;
}

export function fallbackIntent(question: string): QueryIntent {
  return {
    topic: question,
    searches: [searchTerms(question)],
    related: [],
  };
}

export async function expandQuery(question: string): Promise<QueryIntent> {
  const fallback = fallbackIntent(question);
  try {
    const text = await grokComplete({
      system:
        "You rewrite messy human questions into search intent for a comment aggregator. Understand slang, abbreviations, typos, and half-formed asks. Do not invent a different topic. Return JSON only.",
      prompt: `The reader typed: ${question}

Return ONLY JSON:
{
  "topic": "one sentence: the debate they want to hear ordinary people discuss",
  "searches": ["3 short search phrases, 2-6 words each, that would find related comments — synonyms, slang, and the other side of the same debate"],
  "related": ["4-8 related terms or angles that belong to this question even if the reader did not use those words"]
}

Example: "is wfh over?" → searches like "remote work dying", "return to office", "work from home"; related like "RTO mandate", "hybrid work", "WFH productivity".
Do not repeat the original sentence three times. Include how commenters actually talk.`,
      tools: [],
      maxOutputTokens: 350,
      timeoutMs: 16_000,
    });
    const parsed = extractJson(text);
    if (!parsed) return fallback;
    const topic = clip(parsed.topic, 240) || question;
    const searches = strings(parsed.searches, 4, 80);
    const related = strings(parsed.related, 8, 48);
    return {
      topic,
      searches: searches.length ? searches : fallback.searches,
      related,
    };
  } catch {
    return fallback;
  }
}
