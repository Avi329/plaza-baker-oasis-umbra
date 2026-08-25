import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { ChorusComment } from "@/lib/chorus/types";
import { SOURCE_META } from "@/lib/chorus/types";
import { cn } from "@/lib/utils";

const COLLAPSE_AT = 280;

export function CommentCard({
  comment,
  index,
}: {
  comment: ChorusComment;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const long = comment.text.length > COLLAPSE_AT;
  const body = !long || open ? comment.text : `${comment.text.slice(0, COLLAPSE_AT).trimEnd()}…`;
  const meta = SOURCE_META[comment.source];
  const when =
    comment.createdAt > 0
      ? formatDistanceToNowStrict(comment.createdAt, { addSuffix: true })
      : null;

  return (
    <article
      className="rise-in rounded-lg bg-paper px-5 py-4 shadow-[var(--shadow-border)] sm:px-6 sm:py-5"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <header className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <Badge variant="outline">{meta.label}</Badge>
        {comment.community ? <span className="truncate">{comment.community}</span> : null}
        <span className="text-subtle">·</span>
        <span className="truncate">{comment.author}</span>
        {when ? (
          <>
            <span className="text-subtle">·</span>
            <span className="tabular-nums">{when}</span>
          </>
        ) : null}
        {comment.score > 0 ? (
          <>
            <span className="text-subtle">·</span>
            <span className="tabular-nums">{formatScore(comment.score)}</span>
          </>
        ) : null}
      </header>
      {comment.title ? (
        <p className="mt-2 text-xs text-subtle">On: {comment.title}</p>
      ) : null}
      <p className="mt-3 text-[0.975rem] leading-relaxed text-pretty text-fg">{body}</p>
      <footer className="mt-3 flex items-center gap-3">
        {long ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex min-h-9 items-center gap-1 text-xs font-medium text-muted hover:text-fg"
          >
            {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            {open ? "Show less" : "Show more"}
          </button>
        ) : null}
        <a
          href={comment.url}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "ml-auto inline-flex min-h-9 items-center gap-1 text-xs font-medium text-muted",
            "hover:text-fg",
          )}
        >
          Original
          <ArrowUpRight className="size-3.5" />
        </a>
      </footer>
    </article>
  );
}

function formatScore(score: number): string {
  if (score >= 1000) return `${(score / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${score}`;
}
