import {
  COMMENT_PLATFORMS,
  CONSERVATIVE_DESKS,
  conservativeBoost,
  outletFromUrl,
} from "./outlets";
import { extractJson, grokComplete } from "./grok.server";
import { cleanText, isXOrigin } from "./text";
import type { ChorusComment, QueryIntent } from "./types";

const SCHEMA = `{
  "quotes": [
    {
      "text": "verbatim reader comment, not article copy",
      "author": "username or Anonymous",
      "platform": "Disqus | OpenWeb | Viafoura | Coral | Substack | YouTube | Facebook | native",
      "outlet": "site or community if known",
      "url": "https://...",
      "title": "optional article or thread title"
    }
  ]
}`;

function labelCommunity(platform: string, outlet: string): string {
  const p = platform.trim();
  const o = outlet.trim();
  if (p && o && !o.toLowerCase().includes(p.toLowerCase())) return `${p} · ${o}`.slice(0, 80);
  return (o || p || "Comments").slice(0, 80);
}

function packQuote(row: Record<string, unknown>, prefix: string, index: number): ChorusComment | null {
  const text = cleanText(String(row.text ?? ""), 900);
  const author = String(row.author ?? "reader").trim() || "reader";
  if (text.length < 36) return null;
  const url = String(row.url ?? "").trim();
  if (!url || !/^https?:\/\//i.test(url)) return null;
  if (isXOrigin("news", url)) return null;
  const fromUrl = outletFromUrl(url);
  const platform = String(row.platform ?? "").trim();
  const outlet = fromUrl || String(row.outlet ?? row.community ?? "").trim();
  const community = labelCommunity(platform, outlet);
  return {
    id: `news:${prefix}:${index}:${text.slice(0, 20)}`,
    source: "news",
    author: author.slice(0, 48),
    text,
    title: row.title ? String(row.title).slice(0, 160) : undefined,
    community,
    url,
    score: (Number(row.score ?? 0) || 0) + conservativeBoost(community),
    createdAt: 0,
  };
}

function parseQuotes(text: string, prefix: string): ChorusComment[] {
  const parsed = extractJson(text);
  const raw = parsed?.quotes;
  if (!Array.isArray(raw)) return [];
  const comments: ChorusComment[] = [];
  for (const [i, item] of raw.entries()) {
    if (!item || typeof item !== "object") continue;
    const packed = packQuote(item as Record<string, unknown>, prefix, i);
    if (packed) comments.push(packed);
  }
  return comments;
}

function intentBlock(query: string, intent?: QueryIntent): string {
  const related = intent?.related?.length
    ? intent.related.join(", ")
    : "related phrasings of the same subject";
  const topic = intent?.topic || query;
  const searches = (intent?.searches ?? []).join("; ");
  return `Subject (any topic — not limited to news or politics): ${query}
What they mean: ${topic}
Related angles: ${related}
${searches ? `Search phrases: ${searches}` : ""}`;
}

async function harvest(opts: {
  prefix: string;
  prompt: string;
}): Promise<ChorusComment[]> {
  const text = await grokComplete({
    system:
      "You collect real reader comments from Disqus, OpenWeb/Spot.IM, Viafoura, Coral, Substack, YouTube, and native comment threads. Any subject. Never headlines. Never invent comments or URLs. Prefer conservative/right-leaning commenters when choosing among real comments. Never copy X/Twitter. Return JSON only.",
    prompt: opts.prompt,
    tools: [{ type: "web_search" }],
    maxOutputTokens: 2400,
    timeoutMs: 80_000,
  });
  return parseQuotes(text, opts.prefix);
}

export async function fetchNewsComments(
  query: string,
  intent?: QueryIntent,
): Promise<ChorusComment[]> {
  const platforms = COMMENT_PLATFORMS.join(", ");
  const conservative = CONSERVATIVE_DESKS.join(", ");
  const block = intentBlock(query, intent);

  const batches = await Promise.allSettled([
    harvest({
      prefix: "disqus",
      prompt: `${block}

Find *reader comments* on this subject — whatever it is (tech, sports, science, culture, money, health, entertainment, local, politics). Do not skip it because it is not a "news" story.

Search these comment platforms first:
${platforms}

Run searches like:
- site:disqus.com {subject}
- site:spot.im {subject}
- "{subject}" Disqus comments
- "{subject}" OpenWeb comments
- "{subject}" Viafoura OR Coral comments
- "{subject}" "comment thread" readers

Comments live on Disqus discussion pages AND on publisher pages that embed Disqus/OpenWeb. Collect both.

Return ONLY JSON:
${SCHEMA}

Rules:
- 16–22 real comments from Disqus / OpenWeb / Viafoura / Coral / similar, on this subject.
- Mix sites. Put platform AND site in the fields.
- About two-thirds conservative/right-leaning commenters when they exist; keep a minority of other views.
- Never invent. If a platform has nothing public, skip it.
- Skip X/Twitter.`,
    }),
    harvest({
      prefix: "right",
      prompt: `${block}

Find *reader comments* on this same subject under articles and Disqus/OpenWeb widgets on conservative and right-leaning desks:
${conservative}

Also check their Disqus forums, OpenWeb widgets, and native comment pages.

Return ONLY JSON:
${SCHEMA}

Rules:
- 12–20 real comments. Mix desks.
- About two-thirds from those desks; other views allowed if they showed up.
- Never invent. Skip X/Twitter.`,
    }),
  ]);

  const comments: ChorusComment[] = [];
  const seen = new Set<string>();
  for (const result of batches) {
    if (result.status !== "fulfilled") continue;
    for (const comment of result.value) {
      const key = comment.text.toLowerCase().replace(/\s+/g, " ").slice(0, 96);
      if (seen.has(key)) continue;
      seen.add(key);
      comments.push(comment);
    }
  }
  comments.sort((a, b) => b.score - a.score);
  return comments.slice(0, 44);
}
