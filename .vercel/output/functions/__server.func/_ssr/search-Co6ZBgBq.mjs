import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { t as DIRECT_SOURCES } from "./types-Cfri_Pvp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-Co6ZBgBq.js
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
		source
	};
}).handler(fetchChorusSource_createServerFn_handler, async ({ data }) => {
	const { fetchSource } = await import("./sources.server-CrBRTUQj.mjs");
	return fetchSource(data.source, data.query);
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
		comments: (Array.isArray(input?.comments) ? input.comments : []).slice(0, 36)
	};
}).handler(composeChorusPulse_createServerFn_handler, async ({ data }) => {
	const { composePulse } = await import("./pulse.server-CT7b4vQp.mjs");
	const comments = data.comments.filter((row) => row && typeof row === "object" && "text" in row && "source" in row);
	return composePulse(data.query, comments);
});
//#endregion
export { composeChorusPulse_createServerFn_handler, fetchChorusSource_createServerFn_handler };
