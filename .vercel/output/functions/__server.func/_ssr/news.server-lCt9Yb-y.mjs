import { a as outletFromUrl, n as extractJson, r as grokComplete, t as NEWS_OUTLET_NAMES } from "./grok.server-QGuYfm87.mjs";
import { i as isXOrigin, t as cleanText } from "./text-Kg3cA_n2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/news.server-lCt9Yb-y.js
var SCHEMA = `{
  "quotes": [
    {
      "text": "verbatim reader comment, not article copy",
      "author": "username or Anonymous",
      "outlet": "Fox News | NYT | Substack | ...",
      "url": "https://...",
      "title": "optional article headline"
    }
  ]
}`;
function packQuote(row, index) {
	const text = cleanText(String(row.text ?? ""), 900);
	const author = String(row.author ?? "reader").trim() || "reader";
	if (text.length < 40) return null;
	const url = String(row.url ?? "").trim();
	if (!url || !/^https?:\/\//i.test(url)) return null;
	if (isXOrigin("news", url)) return null;
	const outlet = outletFromUrl(url) || String(row.outlet ?? row.community ?? "").trim() || "News";
	return {
		id: `news:${index}:${text.slice(0, 24)}`,
		source: "news",
		author: author.slice(0, 48),
		text,
		title: row.title ? String(row.title).slice(0, 160) : void 0,
		community: outlet.slice(0, 80),
		url,
		score: Number(row.score ?? 0) || 0,
		createdAt: 0
	};
}
async function fetchNewsComments(query) {
	const desks = NEWS_OUTLET_NAMES.join(", ");
	const text = await grokComplete({
		system: "You collect reader comments from news websites and Substack — never headlines, never journalist copy, never X/Twitter posts. Never invent comments or URLs. Return JSON only.",
		prompt: `Topic: ${query}

Search the web for *reader comments* (Disqus, OpenWeb, Coral, Viafoura, native comment threads, Substack comments) under articles on:

${desks}

Also look at other news comment sections when they have relevant reader remarks.

Return ONLY JSON:
${SCHEMA}

Rules:
- 10–16 real comments, mixed across outlets when they exist. Do not dump a single site.
- text must be a reader comment, not a lede or pull-quote from the article.
- url must be the article or comment-thread page you actually found.
- Skip X, Twitter, and Facebook.
- If a desk has no public comments, skip it — do not fabricate.`,
		tools: [{ type: "web_search" }],
		maxOutputTokens: 1600,
		timeoutMs: 8e4
	});
	const raw = extractJson(text)?.quotes;
	if (!Array.isArray(raw)) return [];
	const comments = [];
	for (const [i, item] of raw.entries()) {
		if (!item || typeof item !== "object") continue;
		const packed = packQuote(item, i);
		if (packed) comments.push(packed);
	}
	return comments.slice(0, 16);
}
//#endregion
export { fetchNewsComments };
