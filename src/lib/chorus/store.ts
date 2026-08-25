import { create } from "zustand";
import { composeChorusPulse, fetchChorusSource } from "./search";
import { pushHistory, readHistory } from "./history";
import { isXOrigin } from "./text";
import {
  DIRECT_SOURCES,
  type ChorusComment,
  type ChorusPulse,
  type DirectSource,
  type SourceStatus,
} from "./types";

type StatusMap = Record<DirectSource, SourceStatus>;

const idleSources = (): StatusMap => ({
  reddit: "idle",
  hn: "idle",
  bluesky: "idle",
  lemmy: "idle",
  stack: "idle",
  news: "idle",
});

const pendingSources = (): StatusMap => ({
  reddit: "pending",
  hn: "pending",
  bluesky: "pending",
  lemmy: "pending",
  stack: "pending",
  news: "pending",
});

type ChorusState = {
  query: string;
  phase: "idle" | "listening" | "ready";
  comments: ChorusComment[];
  sources: StatusMap;
  sourceErrors: Partial<Record<DirectSource, string>>;
  pulse: ChorusPulse | null;
  pulsePending: boolean;
  error: string | null;
  recent: string[];
  listen: (query: string) => Promise<void>;
  reset: () => void;
};

let generation = 0;

export const useChorus = create<ChorusState>((set, get) => ({
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
      error: null,
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
      recent,
    });

    const collected: ChorusComment[] = [];
    const forumSources = DIRECT_SOURCES.filter((source) => source !== "news");

    const loadSource = async (source: DirectSource) => {
      try {
        const payload = await fetchChorusSource({ data: { query, source } });
        if (mine !== generation) return;
        collected.push(...payload.comments);
        set((state) => ({
          comments: mergeComments(state.comments, payload.comments),
          sources: {
            ...state.sources,
            [source]: payload.comments.length ? "ok" : payload.error ? "error" : "empty",
          },
          sourceErrors: payload.error
            ? { ...state.sourceErrors, [source]: payload.error }
            : state.sourceErrors,
        }));
      } catch (err) {
        if (mine !== generation) return;
        const message = err instanceof Error ? err.message : "Failed";
        set((state) => ({
          sources: { ...state.sources, [source]: "error" },
          sourceErrors: { ...state.sourceErrors, [source]: message },
        }));
      }
    };

    await Promise.all(forumSources.map(loadSource));
    if (mine !== generation) return;

    const snapshot = collected.length ? [...collected] : get().comments;
    set({ pulsePending: true });
    const newsTask = loadSource("news");
    try {
      const pulse = await composeChorusPulse({ data: { query, comments: snapshot } });
      if (mine !== generation) return;
      set((state) => ({
        pulse,
        pulsePending: false,
        comments: mergeComments(
          state.comments,
          (pulse.quotes ?? []).filter((q) => !isXOrigin(q.source, q.url)),
        ),
        phase: "ready",
      }));
    } catch (err) {
      if (mine !== generation) return;
      const message = err instanceof Error ? err.message : "Could not compose the pulse.";
      set({
        pulsePending: false,
        phase: "ready",
        pulse: {
          headline: "",
          body: "",
          camps: [],
          quotes: [],
          available: false,
          error: message,
        },
      });
    }
    await newsTask;
    if (mine !== generation) return;
  },
}));

function mergeComments(existing: ChorusComment[], incoming: ChorusComment[]): ChorusComment[] {
  const seen = new Set(existing.map((c) => c.id));
  const next = [...existing];
  for (const comment of incoming) {
    if (seen.has(comment.id)) continue;
    seen.add(comment.id);
    next.push(comment);
  }
  return next;
}

export function hydrateRecent() {
  useChorus.setState({ recent: readHistory() });
}
