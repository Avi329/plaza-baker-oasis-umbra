import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { t as DIRECT_SOURCES } from "./types-DFkWyPLH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-DJx0BAqx.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function normalizeQuery(raw) {
	return String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, 280);
}
function sanitizeIntent(raw) {
	if (!raw || typeof raw !== "object") return void 0;
	const row = raw;
	const topic = String(row.topic ?? "").replace(/\s+/g, " ").trim().slice(0, 240);
	const clean = (value, maxItems, maxLen) => {
		if (!Array.isArray(value)) return [];
		const out = [];
		const seen = /* @__PURE__ */ new Set();
		for (const item of value) {
			const text = String(item ?? "").replace(/\s+/g, " ").trim().slice(0, maxLen);
			if (text.length < 3) continue;
			const key = text.toLowerCase();
			if (seen.has(key)) continue;
			seen.add(key);
			out.push(text);
			if (out.length >= maxItems) break;
		}
		return out;
	};
	const searches = clean(row.searches, 4, 80);
	const related = clean(row.related, 8, 48);
	if (!topic && !searches.length && !related.length) return void 0;
	return {
		topic,
		searches,
		related
	};
}
var expandChorusQuery_createServerFn_handler = createServerRpc({
	id: "a5b154c01fd71b911b01d52ace7faad853f4e5ed771afcd02b83349318c284d3",
	name: "expandChorusQuery",
	filename: "src/lib/chorus/search.ts"
}, (opts) => expandChorusQuery.__executeServer(opts));
var expandChorusQuery = createServerFn({ method: "POST" }).validator((input) => {
	const query = normalizeQuery(input?.query);
	if (query.length < 3) throw new Error("Ask a slightly longer question.");
	return { query };
}).handler(expandChorusQuery_createServerFn_handler, async ({ data }) => {
	const { expandQuery } = await import("./expand.server-CL5ariC7.mjs");
	return expandQuery(data.query);
});
var fetchChorusSource_createServerFn_handler = createServerRpc({
	id: "48aa2c8a628103f79c09994c52094d826de08f12c030c48f41c332a6aa3d6ce7",
	name: "fetchChorusSource",
	filename: "src/lib/chorus/search.ts"
}, (opts) => fetchChorusSource.__executeServer(opts));
var fetchChorusSource = createServerFn({ method: "POST" }).validator((input) => {
	const query = normalizeQuery(input?.query);
	const source = input?.source;
	if (query.length < 3) throw new Error("Ask a slightly longer question.");
	if (!DIRECT_SOURCES.includes(source)) throw new Error("Unknown source.");
	return {
		query,
		source,
		intent: sanitizeIntent(input?.intent)
	};
}).handler(fetchChorusSource_createServerFn_handler, async ({ data }) => {
	const { fetchSource } = await import("./sources.server-CgmVEAcD.mjs");
	return fetchSource(data.source, data.query, data.intent);
});
var composeChorusPulse_createServerFn_handler = createServerRpc({
	id: "8c423ae0f6bf1894d035aa64dd04bb435fc9d193d3f27e6dba995ce1d7be678f",
	name: "composeChorusPulse",
	filename: "src/lib/chorus/search.ts"
}, (opts) => composeChorusPulse.__executeServer(opts));
var composeChorusPulse = createServerFn({ method: "POST" }).validator((input) => {
	const query = normalizeQuery(input?.query);
	if (query.length < 3) throw new Error("Ask a slightly longer question.");
	return {
		query,
		comments: (Array.isArray(input?.comments) ? input.comments : []).slice(0, 60),
		intent: sanitizeIntent(input?.intent)
	};
}).handler(composeChorusPulse_createServerFn_handler, async ({ data }) => {
	const { composePulse } = await import("./pulse.server-Cr43aLDx.mjs");
	const comments = data.comments.filter((row) => row && typeof row === "object" && "text" in row && "source" in row);
	return composePulse(data.query, comments, data.intent);
});
//#endregion
export { composeChorusPulse_createServerFn_handler, expandChorusQuery_createServerFn_handler, fetchChorusSource_createServerFn_handler };
