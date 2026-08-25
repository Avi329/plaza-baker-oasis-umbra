import { i as __toESM } from "../_runtime.mjs";
import { i as isXOrigin } from "./text-Kg3cA_n2.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as ChevronUp, c as ArrowUpRight, i as CircleDashed, l as ArrowRight, n as Minus, o as ChevronDown, r as LoaderCircle, s as Check } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as Route } from "./router-BPWOIPai.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { n as EXAMPLE_QUESTIONS, r as SOURCE_META, t as DIRECT_SOURCES } from "./types-Cfri_Pvp.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as formatDistanceToNowStrict } from "../_libs/date-fns.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-sVS7harV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function ChorusMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className: cn("text-fg", className),
		fill: "none",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M7 22.5c0-5.6 4.1-10 9-10s9 4.4 9 10",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M10.5 22.5c0-3.4 2.5-6 5.5-6s5.5 2.6 5.5 6",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "22.5",
				r: "1.7",
				fill: "currentColor"
			})
		]
	});
}
var badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "bg-elevated text-muted",
		accent: "bg-accent/15 text-accent",
		outline: "shadow-[var(--shadow-border)] text-muted"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var COLLAPSE_AT = 280;
function CommentCard({ comment, index }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const long = comment.text.length > COLLAPSE_AT;
	const body = !long || open ? comment.text : `${comment.text.slice(0, COLLAPSE_AT).trimEnd()}…`;
	const meta = SOURCE_META[comment.source];
	const when = comment.createdAt > 0 ? formatDistanceToNowStrict(comment.createdAt, { addSuffix: true }) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rise-in rounded-lg bg-paper px-5 py-4 shadow-[var(--shadow-border)] sm:px-6 sm:py-5",
		style: { animationDelay: `${Math.min(index, 12) * 40}ms` },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: meta.label
					}),
					comment.community ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: comment.community
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: "·"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: comment.author
					}),
					when ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: "·"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: when
					})] }) : null,
					comment.score > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: "·"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: formatScore(comment.score)
					})] }) : null
				]
			}),
			comment.title ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-subtle",
				children: ["On: ", comment.title]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[0.975rem] leading-relaxed text-pretty text-fg",
				children: body
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "mt-3 flex items-center gap-3",
				children: [long ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setOpen((v) => !v),
					className: "inline-flex min-h-9 items-center gap-1 text-xs font-medium text-muted hover:text-fg",
					children: [open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5" }), open ? "Show less" : "Show more"]
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: comment.url,
					target: "_blank",
					rel: "noreferrer",
					className: cn("ml-auto inline-flex min-h-9 items-center gap-1 text-xs font-medium text-muted", "hover:text-fg"),
					children: ["Original", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5" })]
				})]
			})
		]
	});
}
function formatScore(score) {
	if (score >= 1e3) return `${(score / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
	return `${score}`;
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-elevated", className),
		...props
	});
}
function PulsePanel({ pulse, pending }) {
	if (pending && !pulse?.available) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface px-5 py-6 shadow-[var(--shadow-border)] sm:px-8 sm:py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-[0.16em] text-subtle",
				children: "The pulse"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-4 h-8 w-4/5 bg-elevated" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-4 h-4 w-full bg-elevated" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-4 w-11/12 bg-elevated" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-4 w-3/4 bg-elevated" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-sm text-muted",
				children: "Reading forums, news comment threads, and the open web…"
			})
		]
	});
	if (!pulse?.available) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface px-5 py-6 shadow-[var(--shadow-border)] sm:px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium uppercase tracking-[0.16em] text-subtle",
			children: "The pulse"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: pulse?.error ? "Could not synthesize the room this time. The comments below still stand on their own." : "No synthesis yet."
		})]
	});
	const total = pulse.camps.reduce((sum, camp) => sum + camp.share, 0) || 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rise-in rounded-xl bg-surface px-5 py-6 shadow-[var(--shadow-border)] sm:px-8 sm:py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-[0.16em] text-subtle",
				children: "The pulse"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				"data-pulse-headline": true,
				className: "mt-3 font-display text-2xl font-medium leading-snug tracking-display text-balance text-fg sm:text-3xl",
				children: pulse.headline
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 space-y-3 text-[0.975rem] leading-relaxed text-pretty text-fg/90",
				children: pulse.body.split(/\n+/).map((para) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: para }, para.slice(0, 24)))
			}),
			pulse.camps.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-2 overflow-hidden rounded-full bg-elevated",
					children: pulse.camps.map((camp, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full",
						style: {
							width: `${camp.share / total * 100}%`,
							background: `color-mix(in oklab, var(--color-accent) ${90 - i * 22}%, var(--color-elevated))`
						},
						title: `${camp.label} ${camp.share}%`
					}, camp.label))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 grid gap-3 sm:grid-cols-2",
					children: pulse.camps.map((camp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium text-fg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular-nums text-muted",
								children: [camp.share, "%"]
							}),
							" ",
							camp.label
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm leading-snug text-muted",
						children: camp.summary
					})] }, camp.label))
				})]
			}) : null
		]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,color,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-fg text-bg hover:opacity-90",
			secondary: "bg-elevated text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			ghost: "text-muted hover:text-fg hover:bg-elevated",
			outline: "text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] bg-transparent"
		},
		size: {
			default: "h-11 rounded-md px-4 text-sm",
			sm: "h-9 rounded-sm px-3 text-sm",
			lg: "h-12 rounded-lg px-5 text-base",
			icon: "size-11 rounded-md"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function SearchForm({ initial = "", busy, compact, onSubmit }) {
	const [value, setValue] = (0, import_react.useState)(initial);
	(0, import_react.useEffect)(() => {
		setValue(initial);
	}, [initial]);
	function handleSubmit(event) {
		event.preventDefault();
		const next = value.trim();
		if (next.length < 3 || busy) return;
		onSubmit(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: cn("w-full", compact ? "max-w-none" : "max-w-2xl"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("flex items-stretch gap-2 rounded-xl bg-surface p-1.5 shadow-[var(--shadow-border)]", "focus-within:shadow-[var(--shadow-border-hover)]"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: "chorus-q",
					className: "sr-only",
					children: "Ask a question"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "chorus-q",
					value,
					onChange: (event) => setValue(event.target.value),
					placeholder: "What is the internet saying about…",
					autoComplete: "off",
					enterKeyHint: "search",
					className: cn("min-h-11 min-w-0 flex-1 bg-transparent px-3.5 text-base text-fg outline-none", "placeholder:text-subtle")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					disabled: busy || value.trim().length < 3,
					className: "shrink-0 px-4",
					children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: busy ? "Listening" : "Listen"
					})]
				})
			]
		}), !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5 flex flex-wrap gap-2",
			children: EXAMPLE_QUESTIONS.map((question) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => {
					setValue(question);
					onSubmit(question);
				},
				className: "rounded-full px-3 py-1.5 text-left text-xs text-muted shadow-[var(--shadow-border)] transition-colors duration-[var(--motion-quick)] hover:text-fg hover:shadow-[var(--shadow-border-hover)]",
				children: question
			}, question))
		}) : null]
	});
}
var ICONS = {
	idle: CircleDashed,
	pending: LoaderCircle,
	ok: Check,
	empty: Minus,
	error: Minus
};
function SourceRail({ sources, counts }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid grid-cols-2 gap-2 sm:grid-cols-5",
		children: DIRECT_SOURCES.map((source) => {
			const status = sources[source];
			const Icon = ICONS[status];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: cn("flex items-center gap-2 rounded-md bg-surface px-3 py-2.5 text-sm shadow-[var(--shadow-border)]", status === "error" || status === "empty" ? "text-subtle" : "text-fg"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-3.5 shrink-0", status === "pending" && "animate-spin text-muted", status === "ok" && "text-accent") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: SOURCE_META[source].short
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-auto tabular-nums text-xs text-muted",
						children: status === "pending" ? "…" : counts[source] || 0
					})
				]
			}, source);
		})
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function normalizeQuery(raw) {
	return String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, 280);
}
var fetchChorusSource = createServerFn({ method: "POST" }).validator((input) => {
	const query = normalizeQuery(input?.query);
	const source = input?.source;
	if (query.length < 3) throw new Error("Ask a slightly longer question.");
	if (!DIRECT_SOURCES.includes(source)) throw new Error("Unknown source.");
	return {
		query,
		source
	};
}).handler(createSsrRpc("48aa2c8a628103f79c09994c52094d826de08f12c030c48f41c332a6aa3d6ce7"));
var composeChorusPulse = createServerFn({ method: "POST" }).validator((input) => {
	const query = normalizeQuery(input?.query);
	if (query.length < 3) throw new Error("Ask a slightly longer question.");
	return {
		query,
		comments: (Array.isArray(input?.comments) ? input.comments : []).slice(0, 36)
	};
}).handler(createSsrRpc("8c423ae0f6bf1894d035aa64dd04bb435fc9d193d3f27e6dba995ce1d7be678f"));
var KEY = "chorus.recent-questions";
var LIMIT = 8;
function readHistory() {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((item) => typeof item === "string").slice(0, LIMIT);
	} catch {
		return [];
	}
}
function pushHistory(query) {
	const next = [query, ...readHistory().filter((item) => item !== query)].slice(0, LIMIT);
	try {
		window.localStorage.setItem(KEY, JSON.stringify(next));
	} catch {}
	return next;
}
var idleSources = () => ({
	reddit: "idle",
	hn: "idle",
	bluesky: "idle",
	lemmy: "idle",
	stack: "idle"
});
var pendingSources = () => ({
	reddit: "pending",
	hn: "pending",
	bluesky: "pending",
	lemmy: "pending",
	stack: "pending"
});
var generation = 0;
var useChorus = create((set, get) => ({
	query: "",
	phase: "idle",
	comments: [],
	sources: idleSources(),
	sourceErrors: {},
	pulse: null,
	pulsePending: false,
	error: null,
	recent: [],
	reset: () => {
		generation += 1;
		set({
			query: "",
			phase: "idle",
			comments: [],
			sources: idleSources(),
			sourceErrors: {},
			pulse: null,
			pulsePending: false,
			error: null
		});
	},
	listen: async (raw) => {
		const query = raw.replace(/\s+/g, " ").trim();
		if (query.length < 3) {
			set({ error: "Ask a slightly longer question." });
			return;
		}
		const mine = ++generation;
		const recent = pushHistory(query);
		set({
			query,
			phase: "listening",
			comments: [],
			sources: pendingSources(),
			sourceErrors: {},
			pulse: null,
			pulsePending: false,
			error: null,
			recent
		});
		const collected = [];
		await Promise.all(DIRECT_SOURCES.map(async (source) => {
			try {
				const payload = await fetchChorusSource({ data: {
					query,
					source
				} });
				if (mine !== generation) return;
				collected.push(...payload.comments);
				set((state) => ({
					comments: mergeComments(state.comments, payload.comments),
					sources: {
						...state.sources,
						[source]: payload.comments.length ? "ok" : payload.error ? "error" : "empty"
					},
					sourceErrors: payload.error ? {
						...state.sourceErrors,
						[source]: payload.error
					} : state.sourceErrors
				}));
			} catch (err) {
				if (mine !== generation) return;
				const message = err instanceof Error ? err.message : "Failed";
				set((state) => ({
					sources: {
						...state.sources,
						[source]: "error"
					},
					sourceErrors: {
						...state.sourceErrors,
						[source]: message
					}
				}));
			}
		}));
		if (mine !== generation) return;
		const snapshot = collected.length ? collected : get().comments;
		set({ pulsePending: true });
		try {
			const pulse = await composeChorusPulse({ data: {
				query,
				comments: snapshot
			} });
			if (mine !== generation) return;
			set((state) => ({
				pulse,
				pulsePending: false,
				comments: mergeComments(state.comments, (pulse.quotes ?? []).filter((q) => !isXOrigin(q.source, q.url))),
				phase: "ready"
			}));
		} catch (err) {
			if (mine !== generation) return;
			set({
				pulsePending: false,
				phase: "ready",
				pulse: {
					headline: "",
					body: "",
					camps: [],
					quotes: [],
					available: false,
					error: err instanceof Error ? err.message : "Could not compose the pulse."
				}
			});
		}
	}
}));
function mergeComments(existing, incoming) {
	const seen = new Set(existing.map((c) => c.id));
	const next = [...existing];
	for (const comment of incoming) {
		if (seen.has(comment.id)) continue;
		seen.add(comment.id);
		next.push(comment);
	}
	return next;
}
function hydrateRecent() {
	useChorus.setState({ recent: readHistory() });
}
function Results({ onSearch }) {
	const { query, comments, sources, pulse, pulsePending, phase } = useChorus();
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("top");
	const counts = (0, import_react.useMemo)(() => {
		const map = {};
		for (const comment of comments) map[comment.source] = (map[comment.source] ?? 0) + 1;
		return map;
	}, [comments]);
	const directCounts = (0, import_react.useMemo)(() => {
		const map = {
			reddit: 0,
			hn: 0,
			bluesky: 0,
			lemmy: 0,
			stack: 0
		};
		for (const comment of comments) if (comment.source in map) map[comment.source] += 1;
		return map;
	}, [comments]);
	const filters = (0, import_react.useMemo)(() => {
		return Object.keys(counts).sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0));
	}, [counts]);
	const visible = (0, import_react.useMemo)(() => {
		const list = comments.filter((c) => filter === "all" || c.source === filter);
		if (sort === "new") return [...list].sort((a, b) => b.createdAt - a.createdAt || b.score - a.score);
		return [...list].sort((a, b) => b.score - a.score || b.createdAt - a.createdAt);
	}, [
		comments,
		filter,
		sort
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-3xl px-4 pb-20 pt-6 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchForm, {
				initial: query,
				busy: phase === "listening",
				compact: true,
				onSubmit: onSearch
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceRail, {
					sources,
					counts: directCounts
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulsePanel, {
					pulse,
					pending: pulsePending || phase === "listening"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl tracking-display text-fg",
							children: "The comments"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: comments.length ? `${comments.length} voices gathered from public threads` : phase === "listening" ? "Waiting on the first replies…" : "Nothing surfaced this time. Try a more specific question."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-1 self-start rounded-md bg-surface p-1 shadow-[var(--shadow-border)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortChip, {
								active: sort === "top",
								onClick: () => setSort("top"),
								children: "Top"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortChip, {
								active: sort === "new",
								onClick: () => setSort("new"),
								children: "Newest"
							})]
						})]
					}),
					filters.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FilterChip, {
							active: filter === "all",
							onClick: () => setFilter("all"),
							children: ["All", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums text-subtle",
								children: comments.length
							})]
						}), filters.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FilterChip, {
							active: filter === source,
							onClick: () => setFilter(source),
							children: [SOURCE_META[source].short, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums text-subtle",
								children: counts[source]
							})]
						}, source))]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 flex flex-col gap-3",
						children: visible.map((comment, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentCard, {
							comment,
							index
						}, comment.id))
					})
				]
			})
		]
	});
}
function SortChip({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("h-8 rounded-sm px-3 text-xs font-medium", active ? "bg-fg text-bg" : "text-muted hover:text-fg"),
		children
	});
}
function FilterChip({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium", active ? "bg-fg text-bg" : "bg-surface text-muted shadow-[var(--shadow-border)] hover:text-fg"),
		children
	});
}
function IdleHome({ onSearch, recent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-3xl flex-col justify-center px-4 pb-16 pt-10 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-[0.18em] text-subtle",
				children: "Public comments"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 max-w-xl font-display text-4xl font-medium leading-[1.12] tracking-display text-balance text-fg sm:text-5xl",
				children: "Hear the room, not the headline."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 max-w-lg text-base leading-relaxed text-pretty text-muted",
				children: "Ask any news or opinion question. Chorus gathers what readers are actually writing on Reddit, Hacker News, Bluesky, Lemmy, Stack Exchange, Quora, and news-site comment threads. Mood on X is folded into the pulse — posts are never reprinted."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchForm, { onSubmit: onSearch })
			}),
			recent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.16em] text-subtle",
					children: "Recent"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 flex flex-col gap-1",
					children: recent.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						className: "h-auto min-h-10 w-full justify-start px-2 py-2 text-left text-sm font-normal text-muted hover:text-fg",
						onClick: () => onSearch(item),
						children: item
					}) }, item))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-12 max-w-md text-xs leading-relaxed text-subtle",
				children: "Closed gardens like Facebook and most of Quora only appear when they surface publicly. Direct links go back to the original thread."
			})
		]
	});
}
function Home() {
	const { q } = Route.useSearch();
	const navigate = useNavigate({ from: "/" });
	const phase = useChorus((s) => s.phase);
	const query = useChorus((s) => s.query);
	const recent = useChorus((s) => s.recent);
	const listen = useChorus((s) => s.listen);
	const reset = useChorus((s) => s.reset);
	(0, import_react.useEffect)(() => {
		hydrateRecent();
	}, []);
	(0, import_react.useLayoutEffect)(() => {
		const next = q?.trim() ?? "";
		if (!next) {
			if (phase !== "idle") reset();
			return;
		}
		if (next !== query) listen(next);
	}, [
		q,
		query,
		phase,
		listen,
		reset
	]);
	function onSearch(next) {
		navigate({ search: { q: next } });
	}
	function onHome() {
		reset();
		navigate({ search: {} });
	}
	const showHome = phase === "idle" && !q;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between px-4 py-4 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onHome,
				className: "flex min-h-11 items-center gap-2 text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChorusMark, { className: "size-7" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-lg tracking-display",
					children: "Chorus"
				})]
			}), !showHome ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onHome,
				className: "min-h-11 px-2 text-sm text-muted hover:text-fg",
				children: "New question"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs uppercase tracking-[0.16em] text-subtle",
				children: "The public square"
			})]
		}), showHome ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdleHome, {
			onSearch,
			recent
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Results, { onSearch })]
	});
}
//#endregion
export { Home as component };
