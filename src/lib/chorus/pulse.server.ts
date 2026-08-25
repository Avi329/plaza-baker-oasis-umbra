import type { ChorusComment, ChorusPulse, CommentSource, PulseCamp } from "./types";
import { cleanText, isLowQuality, isXOrigin } from "./text";

const PULSE_SCHEMA_HINT = `{
  "headline": "one sentence on the overall mood of regular people",
  "body": "2-3 short paragraphs. Report what commenters are saying, naming platforms. Do not invent unanimity.",
  "camps": [
    { "label": "short camp name", "share": 42, "summary": "what this group argues" }
  ],
  "quotes": [
    {
      "text": "verbatim or faithful excerpt of a real comment",
      "author": "username or Anonymous",
      "source": "reddit|hn|bluesky|quora|news|youtube|facebook|web|lemmy|stack",
      "url": "https://...",
      "community": "optional community or site name",
      "score": 0
    }
  ]
}`;

type GrokJson = {
  headline?: unknown;
  body?: unknown;
  camps?: unknown;
  quotes?: unknown;
};

function extractJson(text: string): GrokJson | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as GrokJson;
  } catch {
    return null;
  }
}

const SOURCE_VALUES: CommentSource[] = [
  "reddit",
  "hn",
  "bluesky",
  "lemmy",
  "stack",
  "x",
  "quora",
  "news",
  "youtube",
  "facebook",
  "web",
];

function coerceSource(value: unknown): CommentSource {
  const s = String(value ?? "web").toLowerCase();
  if (s.includes("reddit")) return "reddit";
  if (s.includes("hack") || s === "hn" || s.includes("ycombinator")) return "hn";
  if (s.includes("bsky") || s.includes("bluesky")) return "bluesky";
  if (s.includes("lemmy")) return "lemmy";
  if (s.includes("stack")) return "stack";
  if (s === "x" || s.includes("twitter")) return "x";
  if (s.includes("quora")) return "quora";
  if (s.includes("youtu")) return "youtube";
  if (s.includes("facebook") || s === "fb") return "facebook";
  if (s.includes("news") || s.includes("disqus") || s.includes("guardian") || s.includes("nyt")) {
    return "news";
  }
  if ((SOURCE_VALUES as string[]).includes(s)) return s as CommentSource;
  return "web";
}

function parseCamps(raw: unknown): PulseCamp[] {
  if (!Array.isArray(raw)) return [];
  const camps: PulseCamp[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const label = String(row.label ?? "").trim();
    const summary = String(row.summary ?? "").trim();
    const share = Number(row.share);
    if (!label || !summary) continue;
    camps.push({
      label: label.slice(0, 48),
      share: Number.isFinite(share) ? Math.max(0, Math.min(100, Math.round(share))) : 0,
      summary: summary.slice(0, 280),
    });
  }
  return camps.slice(0, 4);
}

function parseQuotes(raw: unknown): ChorusComment[] {
  if (!Array.isArray(raw)) return [];
  const quotes: ChorusComment[] = [];
  for (const [index, item] of raw.entries()) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const text = cleanText(String(row.text ?? ""), 900);
    const author = String(row.author ?? "anonymous").trim() || "anonymous";
    if (isLowQuality(text, author)) continue;
    const url = String(row.url ?? "").trim();
    if (url && !/^https?:\/\//i.test(url)) continue;
    const source = coerceSource(row.source);
    if (isXOrigin(source, url)) continue;
    quotes.push({
      id: `web:${index}:${text.slice(0, 24)}`,
      source,
      author: author.slice(0, 48),
      text,
      community: row.community ? String(row.community).slice(0, 80) : undefined,
      url: url || "https://www.google.com/search?q=" + encodeURIComponent(text.slice(0, 80)),
      score: Number(row.score ?? 0) || 0,
      createdAt: 0,
    });
  }
  return quotes.slice(0, 10);
}

function scrubXCopy(text: string): string {
  return text
    .replace(/https?:\/\/(?:www\.)?(?:twitter|x)\.com\/\S+/gi, "")
    .replace(/https?:\/\/t\.co\/\S+/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function digestComments(comments: ChorusComment[]): string {
  const top = [...comments]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((c, i) => {
      const where = [c.source, c.community, c.author].filter(Boolean).join(" / ");
      return `${i + 1}. [${where}] ${c.text.slice(0, 280)}${c.url ? ` (${c.url})` : ""}`;
    });
  return top.join("\n");
}

type ResponsePayload = {
  status?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
      annotations?: Array<{ url?: string; title?: string; type?: string }>;
    }>;
  }>;
  error?: { message?: string };
};

function outputText(payload: ResponsePayload): string {
  const chunks: string[] = [];
  for (const item of payload.output ?? []) {
    if (item.type !== "message") continue;
    for (const block of item.content ?? []) {
      if (block.text) chunks.push(block.text);
    }
  }
  return chunks.join("\n").trim();
}

async function grokPulse(prompt: string): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("AI is not available in this environment");

  const res = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      store: false,
      max_output_tokens: 1800,
      reasoning: { effort: "low" },
      tools: [{ type: "web_search" }, { type: "x_search" }],
      input: [
        {
          role: "system",
          content:
            "You are Chorus, a reporter of public comments — not of headlines. Prefer ordinary readers. Never invent comments, usernames, or URLs. Never copy or quote posts from X (Twitter) verbatim — paraphrase the mood on X in the briefing only. Do not include X/Twitter URLs or tweet text in quotes. If you cannot verify a quote, omit it. Return JSON only.",
        },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`xAI API error ${res.status}${detail ? `: ${detail.slice(0, 180)}` : ""}`);
  }
  const payload = (await res.json()) as ResponsePayload;
  const text = outputText(payload);
  if (!text) throw new Error("Empty model response");
  return text;
}

export async function composePulse(
  query: string,
  comments: ChorusComment[],
): Promise<ChorusPulse> {
  const digest = digestComments(comments);
  const prompt = `Question from a reader: ${query}

Below are real comments already gathered from public forums (Hacker News, Lemmy, Stack Exchange, Reddit, Bluesky when available):
${digest || "(none yet — rely entirely on live search)"}

Now search the open web for additional *reader comments* on this subject: Reddit threads, Hacker News, Quora answers, news-site comment sections (Disqus, The Guardian, NYT, YouTube comments), public Facebook posts if they surface, Bluesky, Lemmy. You may also search X to understand the mood — but never copy, quote, or reprint tweet text, handles, or X URLs.

Return ONLY JSON matching this shape:
${PULSE_SCHEMA_HINT}

Rules:
- camps share numbers should sum to about 100. 2-4 camps.
- 5-8 quotes from forums and comment threads, preferring sources NOT already listed above, with real URLs you actually found.
- Never put X or Twitter posts in "quotes". No tweet text, no x.com / twitter.com / t.co links.
- In "body", you may summarize what people on X are arguing in your own words — no quotation marks around tweets.
- body should read like a briefing on the commentariat, 120-220 words.
- If the evidence is thin, say so.`;

  try {
    const text = await grokPulse(prompt);
    const parsed = extractJson(text);
    if (!parsed) {
      return {
        headline: "The room is talking",
        body: scrubXCopy(cleanText(text, 900)),
        camps: [],
        quotes: [],
        available: true,
      };
    }
    const headline = String(parsed.headline ?? "The room is talking").trim().slice(0, 180);
    const body = String(parsed.body ?? "").trim();
    return {
      headline: headline || "The room is talking",
      body: scrubXCopy(body || cleanText(text, 900)),
      camps: parseCamps(parsed.camps),
      quotes: parseQuotes(parsed.quotes).filter((q) => !isXOrigin(q.source, q.url)),
      available: true,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pulse unavailable";
    return {
      headline: "",
      body: "",
      camps: [],
      quotes: [],
      available: false,
      error: message,
    };
  }
}
