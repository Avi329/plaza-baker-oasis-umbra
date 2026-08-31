//#region node_modules/.nitro/vite/services/ssr/assets/text-DnnNcfza.js
var ENTITY_MAP = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: "\"",
	apos: "'",
	nbsp: " ",
	ndash: "–",
	mdash: "—",
	hellip: "…",
	rsquo: "’",
	lsquo: "‘",
	rdquo: "”",
	ldquo: "“"
};
function decodeEntities(input) {
	return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (full, code) => {
		if (code[0] === "#") {
			const hex = code[1] === "x" || code[1] === "X";
			const num = Number.parseInt(hex ? code.slice(2) : code.slice(1), hex ? 16 : 10);
			return Number.isFinite(num) ? String.fromCodePoint(num) : full;
		}
		return ENTITY_MAP[code] ?? full;
	});
}
function stripHtml(input) {
	return input.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<[^>]+>/g, " ");
}
function cleanText(input, max = 1200) {
	const cleaned = decodeEntities(stripHtml(input)).replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
	if (cleaned.length <= max) return cleaned;
	return `${cleaned.slice(0, max).trimEnd()}…`;
}
function isLowQuality(text, author) {
	if (!text || text.length < 48) return true;
	const a = author.toLowerCase();
	if (!a || a === "[deleted]" || a === "deleted" || a === "automoderator") return true;
	if (/^\[removed\]|^deleted\b/i.test(text)) return true;
	if (/\b(whoishiring|is hiring|we're hiring|seeking (a )?freelance)/i.test(text)) return true;
	if ((text.match(/\|/g) ?? []).length >= 3 && /remote/i.test(text) && text.length < 500) return true;
	return false;
}
function commentKey(text) {
	return text.toLowerCase().replace(/\s+/g, " ").slice(0, 96);
}
function isXOrigin(source, url) {
	if (source === "x" || source === "twitter") return true;
	if (!url) return false;
	try {
		const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
		return host === "x.com" || host === "twitter.com" || host === "t.co" || host.endsWith(".x.com") || host.endsWith(".twitter.com");
	} catch {
		return /(?:^|\.)(?:twitter|x)\.com\b/i.test(url) || /\bt\.co\b/i.test(url);
	}
}
var STOP = /* @__PURE__ */ new Set([
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
	"wants"
]);
/** Turn a natural-language question into keywords APIs can match. */
function searchTerms(question) {
	const words = question.toLowerCase().replace(/[?!.,;:()"']/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
	const terms = [...new Set(words)].slice(0, 6).join(" ");
	return terms.length >= 4 ? terms : question.trim();
}
function clipPhrase(value, maxWords = 8) {
	return value.replace(/[?!]/g, " ").replace(/\s+/g, " ").trim().split(/\s+/).slice(0, maxWords).join(" ");
}
/** Unique short search phrases: keyword strip + intent expansions. */
function searchVariants(question, searches) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const add = (raw) => {
		const phrase = clipPhrase(String(raw ?? ""));
		if (phrase.length < 3) return;
		const key = phrase.toLowerCase();
		if (seen.has(key)) return;
		seen.add(key);
		out.push(phrase);
	};
	add(searchTerms(question));
	for (const extra of searches ?? []) add(extra);
	return out.slice(0, 3);
}
//#endregion
export { searchTerms as a, isXOrigin as i, commentKey as n, searchVariants as o, isLowQuality as r, cleanText as t };
