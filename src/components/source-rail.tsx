import { Check, CircleDashed, LoaderCircle, Minus } from "lucide-react";
import type { DirectSource, SourceStatus } from "@/lib/chorus/types";
import { DIRECT_SOURCES, SOURCE_META } from "@/lib/chorus/types";
import { cn } from "@/lib/utils";

const ICONS: Record<SourceStatus, typeof Check> = {
  idle: CircleDashed,
  pending: LoaderCircle,
  ok: Check,
  empty: Minus,
  error: Minus,
};

export function SourceRail({
  sources,
  counts,
}: {
  sources: Record<DirectSource, SourceStatus>;
  counts: Record<DirectSource, number>;
}) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {DIRECT_SOURCES.map((source) => {
        const status = sources[source];
        const Icon = ICONS[status];
        return (
          <li
            key={source}
            className={cn(
              "flex items-center gap-2 rounded-md bg-surface px-3 py-2.5 text-sm shadow-[var(--shadow-border)]",
              status === "error" || status === "empty" ? "text-subtle" : "text-fg",
            )}
          >
            <Icon
              className={cn(
                "size-3.5 shrink-0",
                status === "pending" && "animate-spin text-muted",
                status === "ok" && "text-accent",
              )}
            />
            <span className="truncate">{SOURCE_META[source].short}</span>
            <span className="ml-auto tabular-nums text-xs text-muted">
              {status === "pending" ? "…" : counts[source] || 0}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
