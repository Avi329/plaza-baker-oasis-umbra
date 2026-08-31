import { n as grokComplete, t as extractJson } from "./grok.server-DMujYtFD.mjs";
import { i as isXOrigin, t as cleanText } from "./text-DnnNcfza.mjs";
import { a as outletFromUrl, n as CONSERVATIVE_DESKS, r as conservativeBoost, t as COMMENT_PLATFORMS } from "./outlets-CJO85fdt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/news.server-BQr0o-zj.js
var SCHEMA = `{
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
function labelCommunity(platform, outlet) {
	const p = platform.trim();
	const o = outlet.trim();
	if (p && o && !o.toLowerCase().includes(p.toLowerCase())) return `${p} · ${o}`.slice(0, 80);
	return (o || p || "Comments").slice(0, 80);
}
function packQuote(row, prefix, index) {
	const text = cleanText(String(row.text ?? ""), 900);
	const author = String(row.author ?? "reader").trim() || "reader";
	if (text.length < 36) return null;
	const url = String(row.url ?? "").trim();
	if (!url || !/^https?:\/\//i.test(url)) return null;
	if (isXOrigin("news", url)) return null;
	const fromUrl = outletFromUrl(url);
	const community = labelCommunity(String(row.platform ?? "").trim(), fromUrl || String(row.outlet ?? row.community ?? "").trim());
	return {
		id: `news:${prefix}:${index}:${text.slice(0, 20)}`,
		source: "news",
		author: author.slice(0, 48),
		text,
		title: row.title ? String(row.title).slice(0, 160) : void 0,
		community,
		url,
		score: (Number(row.score ?? 0) || 0) + conservativeBoost(community),
		createdAt: 0
	};
}
function parseQuotes(text, prefix) {
	const raw = extractJson(text)?.quotes;
	if (!Array.isArray(raw)) return [];
	const comments = [];
	for (const [i, item] of raw.entries()) {
		if (!item || typeof item !== "object") continue;
		const packed = packQuote(item, prefix, i);
		if (packed) comments.push(packed);
	}
	return comments;
}
function intentBlock(query, intent) {
	const related = intent?.related?.length ? intent.related.join(", ") : "related phrasings of the same subject";
	const topic = intent?.topic || query;
	const searches = (intent?.searches ?? []).join("; ");
	return `Subject (any topic — not limited to news or politics): ${query}
What they mean: ${topic}
Related angles: ${related}
${searches ? `Search phrases: ${searches}` : ""}`;
}
async function harvest(opts) {
	return parseQuotes(await grokComplete({
		system: "You collect real reader comments from Disqus, OpenWeb/Spot.IM, Viafoura, Coral, Substack, YouTube, and native comment threads. Any subject. Never headlines. Never invent comments or URLs. Prefer conservative/right-leaning commenters when choosing among real comments. Never copy X/Twitter. Return JSON only.",
		prompt: opts.prompt,
		tools: [{ type: "web_search" }],
		maxOutputTokens: 2400,
		timeoutMs: 8e4
	}), opts.prefix);
}
async function fetchNewsComments(query, intent) {
	const platforms = COMMENT_PLATFORMS.join(", ");
	const conservative = CONSERVATIVE_DESKS.join(", ");
	const block = intentBlock(query, intent);
	const batches = await Promise.allSettled([harvest({
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
- Skip X/Twitter.`
	}), harvest({
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
- Never invent. Skip X/Twitter.`
	})]);
	const comments = [];
	const seen = /* @__PURE__ */ new Set();
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
//#endregion
export { fetchNewsComments };
