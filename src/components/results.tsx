import { useMemo, useState } from "react";
import { CommentCard } from "@/components/comment-card";
import { PulsePanel } from "@/components/pulse-panel";
import { SearchForm } from "@/components/search-form";
import { SourceRail } from "@/components/source-rail";
import { Button } from "@/components/ui/button";
import type { ChorusComment, CommentSource, DirectSource } from "@/lib/chorus/types";
import { SOURCE_META } from "@/lib/chorus/types";
import { useChorus } from "@/lib/chorus/store";
import { cn } from "@/lib/utils";

type Filter = "all" | CommentSource;
type Sort = "top" | "new";

export function Results({ onSearch }: { onSearch: (query: string) => void }) {
  const { query, comments, sources, pulse, pulsePending, phase, intent } = useChorus();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("top");

  const counts = useMemo(() => {
    const map: Partial<Record<CommentSource, number>> = {};
    for (const comment of comments) {
      map[comment.source] = (map[comment.source] ?? 0) + 1;
    }
    return map;
  }, [comments]);

  const directCounts = useMemo(() => {
    const map = {
      reddit: 0,
      hn: 0,
      bluesky: 0,
      lemmy: 0,
      stack: 0,
      news: 0,
    } satisfies Record<DirectSource, number>;
    for (const comment of comments) {
      if (comment.source in map) {
        map[comment.source as DirectSource] += 1;
      }
    }
    return map;
  }, [comments]);

  const filters = useMemo(() => {
    const present = (Object.keys(counts) as CommentSource[]).sort(
      (a, b) => (counts[b] ?? 0) - (counts[a] ?? 0),
    );
    return present;
  }, [counts]);

  const visible = useMemo(() => {
    const list = comments.filter((c) => filter === "all" || c.source === filter);
    if (sort === "new") {
      return [...list].sort((a, b) => b.createdAt - a.createdAt || b.score - a.score);
    }
    return [...list].sort((a, b) => b.score - a.score || b.createdAt - a.createdAt);
  }, [comments, filter, sort]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-6 sm:px-6">
      <SearchForm initial={query} busy={phase === "listening"} compact onSubmit={onSearch} />

      {intent?.related?.length ? (
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Also listening for {intent.related.slice(0, 6).join(" · ")}
        </p>
      ) : intent?.topic ? (
        <p className="mt-3 text-xs leading-relaxed text-muted">{intent.topic}</p>
      ) : null}

      <div className="mt-6">
        <SourceRail sources={sources} counts={directCounts} />
      </div>

      <div className="mt-6">
        <PulsePanel pulse={pulse} pending={pulsePending || phase === "listening"} />
      </div>

      <section className="mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-xl tracking-display text-fg">The comments</h2>
            <p className="mt-1 text-sm text-muted">
              {comments.length
                ? `${comments.length} voices gathered from public threads`
                : phase === "listening"
                  ? "Matching Disqus, OpenWeb, and related comments on this subject…"
                  : "Nothing surfaced this time. Try another angle."}
            </p>
          </div>
          <div className="flex gap-1 self-start rounded-md bg-surface p-1 shadow-[var(--shadow-border)]">
            <SortChip active={sort === "top"} onClick={() => setSort("top")}>
              Top
            </SortChip>
            <SortChip active={sort === "new"} onClick={() => setSort("new")}>
              Newest
            </SortChip>
          </div>
        </div>

        {filters.length > 0 ? (
          <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
              All
              <span className="tabular-nums text-subtle">{comments.length}</span>
            </FilterChip>
            {filters.map((source) => (
              <FilterChip
                key={source}
                active={filter === source}
                onClick={() => setFilter(source)}
              >
                {SOURCE_META[source].short}
                <span className="tabular-nums text-subtle">{counts[source]}</span>
              </FilterChip>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3">
          {visible.map((comment, index) => (
            <CommentCard key={comment.id} comment={comment} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SortChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-sm px-3 text-xs font-medium",
        active ? "bg-fg text-bg" : "text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium",
        active
          ? "bg-fg text-bg"
          : "bg-surface text-muted shadow-[var(--shadow-border)] hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

export function IdleHome({
  onSearch,
  recent,
}: {
  onSearch: (query: string) => void;
  recent: string[];
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-3xl flex-col justify-center px-4 pb-16 pt-10 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-subtle">Public comments</p>
      <h1 className="mt-4 max-w-xl font-display text-4xl font-medium leading-[1.12] tracking-display text-balance text-fg sm:text-5xl">
        Hear the room, not the headline.
      </h1>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-pretty text-muted">
        Ask anything. Chorus reads the intent and picks reader comments on that subject from
        Disqus, OpenWeb, Viafoura, Coral, Substack, YouTube, and native comment threads — not
        only news-desk pages — plus Reddit, Hacker News, Bluesky, Lemmy, and Stack Exchange.
        Conservative and right-leaning commenters get more of the floor. Mood on X is folded
        into the pulse — posts are never reprinted.
      </p>
      <div className="mt-8">
        <SearchForm onSubmit={onSearch} />
      </div>
      {recent.length > 0 ? (
        <div className="mt-10">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">Recent</p>
          <ul className="mt-3 flex flex-col gap-1">
            {recent.map((item) => (
              <li key={item}>
                <Button
                  variant="ghost"
                  className="h-auto min-h-10 w-full justify-start px-2 py-2 text-left text-sm font-normal text-muted hover:text-fg"
                  onClick={() => onSearch(item)}
                >
                  {item}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="mt-12 max-w-md text-xs leading-relaxed text-subtle">
        Closed gardens like Facebook and most of Quora only appear when they surface publicly.
        Direct links go back to the original thread.
      </p>
    </div>
  );
}
