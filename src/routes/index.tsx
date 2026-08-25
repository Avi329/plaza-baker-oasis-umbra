import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useLayoutEffect } from "react";
import { ChorusMark } from "@/components/chorus-mark";
import { IdleHome, Results } from "@/components/results";
import { hydrateRecent, useChorus } from "@/lib/chorus/store";

type Search = { q?: string };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: Home,
});

function Home() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const phase = useChorus((s) => s.phase);
  const query = useChorus((s) => s.query);
  const recent = useChorus((s) => s.recent);
  const listen = useChorus((s) => s.listen);
  const reset = useChorus((s) => s.reset);

  useEffect(() => {
    hydrateRecent();
  }, []);

  useLayoutEffect(() => {
    const next = q?.trim() ?? "";
    if (!next) {
      if (phase !== "idle") reset();
      return;
    }
    if (next !== query) {
      void listen(next);
    }
  }, [q, query, phase, listen, reset]);

  function onSearch(next: string) {
    void navigate({ search: { q: next } });
  }

  function onHome() {
    reset();
    void navigate({ search: {} });
  }

  const showHome = phase === "idle" && !q;

  return (
    <div className="min-h-dvh">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={onHome}
          className="flex min-h-11 items-center gap-2 text-fg"
        >
          <ChorusMark className="size-7" />
          <span className="font-display text-lg tracking-display">Chorus</span>
        </button>
        {!showHome ? (
          <button
            type="button"
            onClick={onHome}
            className="min-h-11 px-2 text-sm text-muted hover:text-fg"
          >
            New question
          </button>
        ) : (
          <span className="text-xs uppercase tracking-[0.16em] text-subtle">The public square</span>
        )}
      </header>
      {showHome ? <IdleHome onSearch={onSearch} recent={recent} /> : <Results onSearch={onSearch} />}
    </div>
  );
}
