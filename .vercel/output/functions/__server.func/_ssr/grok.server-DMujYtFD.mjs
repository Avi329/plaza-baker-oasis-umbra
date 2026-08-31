//#region node_modules/.nitro/vite/services/ssr/assets/grok.server-DMujYtFD.js
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
	const body = {
		model: "grok-4.5",
		store: false,
		max_output_tokens: opts.maxOutputTokens ?? 1600,
		reasoning: { effort: "low" },
		input: [{
			role: "system",
			content: opts.system
		}, {
			role: "user",
			content: opts.prompt
		}]
	};
	if (opts.tools && opts.tools.length > 0) body.tools = opts.tools;
	const res = await fetch("https://api.x.ai/v1/responses", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify(body),
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
export { grokComplete as n, extractJson as t };
