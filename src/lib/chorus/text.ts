const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

export function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (full, code: string) => {
    if (code[0] === "#") {
      const hex = code[1] === "x" || code[1] === "X";
      const num = Number.parseInt(hex ? code.slice(2) : code.slice(1), hex ? 16 : 10);
      return Number.isFinite(num) ? String.fromCodePoint(num) : full;
    }
    return ENTITY_MAP[code] ?? full;
  });
}

export function stripHtml(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
}

export function cleanText(input: string, max = 1200): string {
  const cleaned = decodeEntities(stripHtml(input))
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trimEnd()}…`;
}

export function isLowQuality(text: string, author: string): boolean {
  if (!text || text.length < 48) return true;
  const a = author.toLowerCase();
  if (!a || a === "[deleted]" || a === "deleted" || a === "automoderator") return true;
  if (/^\[removed\]|^deleted\b/i.test(text)) return true;
  if (/\b(whoishiring|is hiring|we're hiring|seeking (a )?freelance)/i.test(text)) return true;
  if ((text.match(/\|/g) ?? []).length >= 3 && /remote/i.test(text) && text.length < 500) {
    return true;
  }
  return false;
}

export function commentKey(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").slice(0, 96);
}

export function isXOrigin(source?: string, url?: string): boolean {
  if (source === "x" || source === "twitter") return true;
  if (!url) return false;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return (
      host === "x.com" ||
      host === "twitter.com" ||
      host === "t.co" ||
      host.endsWith(".x.com") ||
      host.endsWith(".twitter.com")
    );
  } catch {
    return /(?:^|\.)(?:twitter|x)\.com\b/i.test(url) || /\bt\.co\b/i.test(url);
  }
}

const STOP = new Set([
  "is",
  "are",
  "was",
  "were",
  "do",
  "does",
  "did",
  "what",
  "why",
  "how",
  "when",
  "where",
  "who",
  "the",
  "a",
  "an",
  "of",
  "to",
  "for",
  "in",
  "on",
  "at",
  "and",
  "or",
  "but",
  "about",
  "people",
  "think",
  "thinking",
  "actually",
  "really",
  "still",
  "just",
  "any",
  "i",
  "we",
  "you",
  "your",
  "should",
  "would",
  "could",
  "can",
  "will",
  "latest",
  "new",
  "get",
  "got",
  "have",
  "has",
  "been",
  "being",
  "this",
  "that",
  "these",
  "those",
  "with",
  "from",
  "into",
  "over",
  "than",
  "then",
  "them",
  "they",
  "their",
  "our",
  "my",
  "me",
  "us",
  "it",
  "its",
  "if",
  "so",
  "not",
  "no",
  "yes",
  "ask",
  "question",
  "opinion",
  "news",
  "internet",
  "saying",
  "said",
  "like",
  "want",
  "wants",
]);

/** Turn a natural-language question into keywords APIs can match. */
export function searchTerms(question: string): string {
  const words = question
    .toLowerCase()
    .replace(/[?!.,;:()"']/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
  const unique = [...new Set(words)];
  const terms = unique.slice(0, 6).join(" ");
  return terms.length >= 4 ? terms : question.trim();
}
