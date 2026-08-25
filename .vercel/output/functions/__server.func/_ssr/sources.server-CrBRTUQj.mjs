import { a as searchTerms, n as commentKey, r as isLowQuality, t as cleanText } from "./text-Kg3cA_n2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sources.server-CrBRTUQj.js
var TIMEOUT_MS = 1e4;
var USER_AGENT = "Mozilla/5.0 (compatible; Chorus/1.0; comment-aggregator; +https://grok.com)";
async function fetchJson(url, init, timeout = TIMEOUT_MS) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeout);
	try {
		const res = await fetch(url, {
			...init,
			signal: controller.signal,
			headers: {
				Accept: "application/json",
				"User-Agent": USER_AGENT,
				...init?.headers ?? {}
			}
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.json();
	} finally {
		clearTimeout(timer);
	}
}
function uniq(comments) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const c of comments) {
		const key = commentKey(c.text);
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(c);
	}
	return out;
}
function sortByScore(comments) {
	return [...comments].sort((a, b) => b.score - a.score || b.createdAt - a.createdAt);
}
function pack(comment) {
	const packed = {
		id: String(comment.id),
		source: comment.source,
		author: String(comment.author || "anonymous"),
		text: String(comment.text),
		url: String(comment.url),
		score: Number.isFinite(comment.score) ? comment.score : 0,
		createdAt: Number.isFinite(comment.createdAt) ? comment.createdAt : 0
	};
	if (comment.title) packed.title = String(comment.title);
	if (comment.community) packed.community = String(comment.community);
	return packed;
}
async function fetchReddit(query) {
	const endpoints = [`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&type=comment&sort=relevance&t=year&limit=25&raw_json=1`, `https://old.reddit.com/search.json?q=${encodeURIComponent(query)}&type=comment&sort=comments&t=year&limit=25&raw_json=1`];
	let lastError;
	for (const url of endpoints) try {
		const json = await fetchJson(url, { headers: { "User-Agent": "web:chorus:v1.0 (by /u/chorus-reader)" } });
		const comments = [];
		for (const child of json.data?.children ?? []) {
			const d = child.data;
			if (!d) continue;
			const text = cleanText(d.body || d.selftext || "");
			const author = d.author ?? "unknown";
			if (isLowQuality(text, author)) continue;
			const permalink = d.permalink ? `https://www.reddit.com${d.permalink}` : `https://www.reddit.com/comments/${d.id ?? ""}`;
			comments.push({
				id: `reddit:${d.name || d.id || permalink}`,
				source: "reddit",
				author,
				text,
				title: d.link_title || d.title,
				community: d.subreddit ? `r/${d.subreddit}` : void 0,
				url: permalink,
				score: Number(d.score ?? 0),
				createdAt: Math.round((d.created_utc ?? 0) * 1e3)
			});
		}
		if (comments.length) return sortByScore(uniq(comments)).slice(0, 20);
	} catch (err) {
		lastError = err;
	}
	if (lastError) throw lastError;
	return [];
}
async function fetchHn(query) {
	const json = await fetchJson(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=comment&hitsPerPage=30`, void 0, 8e3);
	const comments = [];
	for (const hit of json.hits ?? []) {
		const text = cleanText(hit.comment_text || "");
		const author = hit.author ?? "unknown";
		if (isLowQuality(text, author)) continue;
		const id = hit.objectID ?? `${hit.story_id}-${author}`;
		comments.push({
			id: `hn:${id}`,
			source: "hn",
			author,
			text,
			title: hit.story_title || void 0,
			community: "Hacker News",
			url: `https://news.ycombinator.com/item?id=${id}`,
			score: Number(hit.points ?? 0),
			createdAt: (hit.created_at_i ?? 0) * 1e3
		});
	}
	return sortByScore(uniq(comments)).slice(0, 20);
}
function bskyUrl(uri, handle) {
	return `https://bsky.app/profile/${handle}/post/${uri.split("/").pop() ?? ""}`;
}
async function fetchBluesky(query) {
	const json = await fetchJson(`https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(query)}&limit=25&sort=top`);
	const comments = [];
	for (const post of json.posts ?? []) {
		const text = cleanText(post.record?.text || "");
		const handle = post.author?.handle ?? "unknown";
		if (isLowQuality(text, handle)) continue;
		const uri = post.uri ?? `${handle}:${text.slice(0, 20)}`;
		comments.push({
			id: `bsky:${uri}`,
			source: "bluesky",
			author: post.author?.displayName || handle,
			text,
			community: `@${handle}`,
			url: bskyUrl(uri, handle),
			score: Number(post.likeCount ?? 0),
			createdAt: post.indexedAt ? Date.parse(post.indexedAt) : 0
		});
	}
	return sortByScore(uniq(comments)).slice(0, 18);
}
async function fetchLemmyInstance(host, query) {
	const json = await fetchJson(`https://${host}/api/v3/search?q=${encodeURIComponent(query)}&type_=Comments&sort=TopAll&listing_type=All&limit=20`, void 0, 12e3);
	const comments = [];
	for (const row of json.comments ?? []) {
		const text = cleanText(row.comment?.content || "");
		const author = row.creator?.name ?? "unknown";
		if (isLowQuality(text, author)) continue;
		const id = row.comment?.id ?? comments.length;
		comments.push({
			id: `lemmy:${host}:${id}`,
			source: "lemmy",
			author,
			text,
			title: row.post?.name,
			community: row.community?.name ? `${row.community.name}@${host}` : host,
			url: row.comment?.ap_id || `https://${host}/comment/${id}`,
			score: Number(row.counts?.score ?? 0),
			createdAt: row.comment?.published ? Date.parse(row.comment.published) : 0
		});
	}
	return comments;
}
async function fetchLemmy(query) {
	const batches = await Promise.allSettled(["lemmy.world", "lemmy.ml"].map((host) => fetchLemmyInstance(host, query)));
	const comments = [];
	let lastError;
	for (const result of batches) if (result.status === "fulfilled") comments.push(...result.value);
	else lastError = result.reason;
	const unique = sortByScore(uniq(comments)).slice(0, 20);
	if (!unique.length && lastError) throw lastError;
	return unique;
}
var SE_SITES = [
	{
		site: "workplace",
		host: "workplace.stackexchange.com"
	},
	{
		site: "politics",
		host: "politics.stackexchange.com"
	},
	{
		site: "skeptics",
		host: "skeptics.stackexchange.com"
	},
	{
		site: "academia",
		host: "academia.stackexchange.com"
	}
];
async function fetchStackSite(site, query) {
	const json = await fetchJson(`https://api.stackexchange.com/2.3/search/excerpts?order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=${site.site}&pagesize=8`);
	const comments = [];
	for (const item of json.items ?? []) {
		const text = cleanText(item.body || item.excerpt || "");
		const author = item.owner?.display_name || "member";
		if (isLowQuality(text, author)) continue;
		const qid = item.question_id;
		if (!qid) continue;
		const hash = item.answer_id ? `#${item.answer_id}` : "";
		comments.push({
			id: `stack:${site.site}:${item.answer_id || qid}`,
			source: "stack",
			author,
			text,
			title: item.title,
			community: site.site,
			url: `https://${site.host}/questions/${qid}${hash}`,
			score: Number(item.score ?? 0),
			createdAt: (item.creation_date ?? 0) * 1e3
		});
	}
	return comments;
}
async function fetchStack(query) {
	const batches = await Promise.allSettled(SE_SITES.map((site) => fetchStackSite(site, query)));
	const comments = [];
	let lastError;
	for (const result of batches) if (result.status === "fulfilled") comments.push(...result.value);
	else lastError = result.reason;
	const unique = sortByScore(uniq(comments)).slice(0, 18);
	if (!unique.length && lastError) throw lastError;
	return unique;
}
var FETCHERS = {
	reddit: fetchReddit,
	hn: fetchHn,
	bluesky: fetchBluesky,
	lemmy: fetchLemmy,
	stack: fetchStack
};
async function fetchSource(source, query) {
	const terms = searchTerms(query);
	try {
		const comments = (await FETCHERS[source](terms)).map(pack);
		return {
			source,
			comments,
			error: comments.length ? void 0 : "No matching comments"
		};
	} catch (err) {
		return {
			source,
			comments: [],
			error: err instanceof Error ? err.message : "Request failed"
		};
	}
}
//#endregion
export { fetchSource };
