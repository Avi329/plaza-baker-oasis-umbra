import { n as grokComplete, t as extractJson } from "./grok.server-DMujYtFD.mjs";
import { i as isXOrigin, r as isLowQuality, t as cleanText } from "./text-DnnNcfza.mjs";
import { a as outletFromUrl, i as isNewsOutletName, n as CONSERVATIVE_DESKS, r as conservativeBoost } from "./outlets-CJO85fdt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pulse.server-Cr43aLDx.js
var PULSE_SCHEMA_HINT = `{
  "headline": "one sentence on the overall mood of regular people",
  "body": "2-3 short paragraphs. Report what commenters are saying, naming platforms and news desks. Do not invent unanimity.",
  "camps": [
    { "label": "short camp name", "share": 42, "summary": "what this group argues" }
  ],
  "quotes": [
    {
      "text": "verbatim or faithful excerpt of a real comment",
      "author": "username or Anonymous",
      "source": "reddit|hn|bluesky|quora|news|youtube|facebook|web|lemmy|stack",
      "community": "outlet or community name (e.g. Fox News, NYT, Substack)",
      "url": "https://...",
      "score": 0
    }
  ]
}`;
function coerceSource(value, url) {
	if (url) {
		if (isXOrigin("web", url)) return "x";
		if (outletFromUrl(url)) return "news";
	}
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
	if (s.includes("news") || s.includes("disqus") || s.includes("openweb") || s.includes("spot.im") || s.includes("viafoura") || s.includes("coral") || s.includes("substack") || isNewsOutletName(s)) return "news";
	return "web";
}
function parseCamps(raw) {
	if (!Array.isArray(raw)) return [];
	const camps = [];
	for (const item of raw) {
		if (!item || typeof item !== "object") continue;
		const row = item;
		const label = String(row.label ?? "").trim();
		const summary = String(row.summary ?? "").trim();
		const share = Number(row.share);
		if (!label || !summary) continue;
		camps.push({
			label: label.slice(0, 48),
			share: Number.isFinite(share) ? Math.max(0, Math.min(100, Math.round(share))) : 0,
			summary: summary.slice(0, 280)
		});
	}
	return camps.slice(0, 4);
}
function parseQuotes(raw) {
	if (!Array.isArray(raw)) return [];
	const quotes = [];
	for (const [index, item] of raw.entries()) {
		if (!item || typeof item !== "object") continue;
		const row = item;
		const text = cleanText(String(row.text ?? ""), 900);
		const author = String(row.author ?? "anonymous").trim() || "anonymous";
		if (isLowQuality(text, author)) continue;
		const url = String(row.url ?? "").trim();
		if (url && !/^https?:\/\//i.test(url)) continue;
		const source = coerceSource(row.source, url);
		if (isXOrigin(source, url)) continue;
		const community = (url ? outletFromUrl(url) : void 0) || (row.community ? String(row.community).slice(0, 80) : void 0) || (row.outlet ? String(row.outlet).slice(0, 80) : void 0) || (row.platform ? String(row.platform).slice(0, 80) : void 0);
		quotes.push({
			id: `web:${index}:${text.slice(0, 24)}`,
			source,
			author: author.slice(0, 48),
			text,
			community,
			url: url || "https://www.google.com/search?q=" + encodeURIComponent(text.slice(0, 80)),
			score: (Number(row.score ?? 0) || 0) + conservativeBoost(community),
			createdAt: 0
		});
	}
	return quotes.slice(0, 24);
}
function scrubXCopy(text) {
	return text.replace(/https?:\/\/(?:www\.)?(?:twitter|x)\.com\/\S+/gi, "").replace(/https?:\/\/t\.co\/\S+/gi, "").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
function digestComments(comments) {
	return [...comments].sort((a, b) => b.score - a.score).slice(0, 36).map((c, i) => {
		const where = [
			c.source,
			c.community,
			c.author
		].filter(Boolean).join(" / ");
		return `${i + 1}. [${where}] ${c.text.slice(0, 240)}${c.url ? ` (${c.url})` : ""}`;
	}).join("\n");
}
async function composePulse(query, comments, intent) {
	const digest = digestComments(comments);
	const related = intent?.related?.length ? intent.related.join(", ") : "";
	const prompt = `Question from a reader (any subject — not only news. Slang and related debates count): ${query}
What they mean: ${intent?.topic || query}
${related ? `Related angles that belong in the answer: ${related}` : ""}

Below are real comments already gathered:
${digest || "(none yet — rely entirely on live search)"}

Search the open web for *reader comments on this subject* — whatever it is. Hunt Disqus, OpenWeb/Spot.IM, Viafoura, Coral, Vuukle, Substack, YouTube, and native comment threads. Also conservative desks: ${CONSERVATIVE_DESKS.join(", ")}.

Search like: site:disqus.com {subject}, "{subject}" Disqus comments, "{subject}" OpenWeb comments.

You may search X for mood only — never copy tweet text.

Return ONLY JSON matching this shape:
${PULSE_SCHEMA_HINT}

Rules:
- camps share numbers should sum to about 100. 2-4 camps. Report camps honestly.
- 12-20 quotes, preferring Disqus / OpenWeb / comment-widget comments NOT already listed, with real URLs.
- When selecting quotes, give about two-thirds of the floor to conservative and right-leaning readers. Still include other views.
- Mix platforms. Put the platform or desk in "community". source should be "news" for Disqus/OpenWeb/desk comments.
- Include related comments that belong to the same question even if the wording differs.
- Never put X or Twitter posts in "quotes".
- body should read like a briefing on the commentariat, 120-220 words, with conservative voices given more space.
- If the evidence is thin, say so.`;
	try {
		const text = await grokComplete({
			system: "You are Chorus, a reporter of public comments on any subject — not of headlines. Prefer Disqus, OpenWeb, Coral, Viafoura, Substack, and native comment threads. Give more of the floor to conservative and right-leaning commenters when selecting quotes, while still naming other camps honestly. Never invent comments, usernames, or URLs. Never copy posts from X (Twitter) verbatim. Return JSON only.",
			prompt,
			tools: [{ type: "web_search" }, { type: "x_search" }],
			maxOutputTokens: 2400,
			timeoutMs: 9e4
		});
		const parsed = extractJson(text);
		if (!parsed) return {
			headline: "The room is talking",
			body: scrubXCopy(cleanText(text, 900)),
			camps: [],
			quotes: [],
			available: true
		};
		const headline = String(parsed.headline ?? "The room is talking").trim().slice(0, 180);
		const body = String(parsed.body ?? "").trim();
		return {
			headline: headline || "The room is talking",
			body: scrubXCopy(body || cleanText(text, 900)),
			camps: parseCamps(parsed.camps),
			quotes: parseQuotes(parsed.quotes).filter((q) => !isXOrigin(q.source, q.url)),
			available: true
		};
	} catch (err) {
		return {
			headline: "",
			body: "",
			camps: [],
			quotes: [],
			available: false,
			error: err instanceof Error ? err.message : "Pulse unavailable"
		};
	}
}
//#endregion
export { composePulse };
