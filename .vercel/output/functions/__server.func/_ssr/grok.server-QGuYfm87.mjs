//#region node_modules/.nitro/vite/services/ssr/assets/grok.server-QGuYfm87.js
var NEWS_OUTLETS = [
	{
		name: "Breitbart",
		hosts: ["breitbart.com"]
	},
	{
		name: "Fox News",
		hosts: ["foxnews.com"]
	},
	{
		name: "The Hill",
		hosts: ["thehill.com"]
	},
	{
		name: "Boston Globe",
		hosts: ["bostonglobe.com"]
	},
	{
		name: "Financial Times",
		hosts: ["ft.com"]
	},
	{
		name: "Washington Post",
		hosts: ["washingtonpost.com", "wapo.st"]
	},
	{
		name: "Wall Street Journal",
		hosts: ["wsj.com"]
	},
	{
		name: "The Telegraph",
		hosts: ["telegraph.co.uk"]
	},
	{
		name: "Zero Hedge",
		hosts: ["zerohedge.com"]
	},
	{
		name: "Epoch Times",
		hosts: ["theepochtimes.com", "epochnews.com"]
	},
	{
		name: "UnHerd",
		hosts: ["unherd.com"]
	},
	{
		name: "Mother Jones",
		hosts: ["motherjones.com"]
	},
	{
		name: "New York Times",
		hosts: ["nytimes.com", "nyti.ms"]
	},
	{
		name: "Substack",
		hosts: ["substack.com"]
	},
	{
		name: "The Guardian",
		hosts: ["theguardian.com", "theguardian.co.uk"]
	},
	{
		name: "The Atlantic",
		hosts: ["theatlantic.com"]
	},
	{
		name: "National Review",
		hosts: ["nationalreview.com"]
	}
];
var NEWS_OUTLET_NAMES = NEWS_OUTLETS.map((o) => o.name);
function outletFromUrl(url) {
	try {
		const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
		if (host.endsWith(".substack.com") || host === "substack.com") return "Substack";
		for (const outlet of NEWS_OUTLETS) if (outlet.hosts.some((h) => host === h || host.endsWith(`.${h}`))) return outlet.name;
	} catch {}
}
function isNewsOutletName(value) {
	const s = value.toLowerCase();
	return NEWS_OUTLETS.some((o) => s.includes(o.name.toLowerCase()) || o.hosts.some((h) => s.includes(h)));
}
function outputText(payload) {
	const chunks = [];
	for (const item of payload.output ?? []) {
		if (item.type !== "message") continue;
		for (const block of item.content ?? []) if (block.text) chunks.push(block.text);
	}
	return chunks.join("\n").trim();
}
function extractJson(text) {
	const raw = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? text;
	const start = raw.indexOf("{");
	const end = raw.lastIndexOf("}");
	if (start < 0 || end <= start) return null;
	try {
		return JSON.parse(raw.slice(start, end + 1));
	} catch {
		return null;
	}
}
async function grokComplete(opts) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) throw new Error("AI is not available in this environment");
	const res = await fetch("https://api.x.ai/v1/responses", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			store: false,
			max_output_tokens: opts.maxOutputTokens ?? 1600,
			reasoning: { effort: "low" },
			tools: opts.tools ?? [{ type: "web_search" }],
			input: [{
				role: "system",
				content: opts.system
			}, {
				role: "user",
				content: opts.prompt
			}]
		}),
		signal: AbortSignal.timeout(opts.timeoutMs ?? 9e4)
	});
	if (!res.ok) {
		const detail = await res.text().catch(() => "");
		throw new Error(`xAI API error ${res.status}${detail ? `: ${detail.slice(0, 180)}` : ""}`);
	}
	const text = outputText(await res.json());
	if (!text) throw new Error("Empty model response");
	return text;
}
//#endregion
export { outletFromUrl as a, isNewsOutletName as i, extractJson as n, grokComplete as r, NEWS_OUTLET_NAMES as t };
