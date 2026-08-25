import { ArrowRight, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EXAMPLE_QUESTIONS } from "@/lib/chorus/types";
import { cn } from "@/lib/utils";

type SearchFormProps = {
  initial?: string;
  busy?: boolean;
  compact?: boolean;
  onSubmit: (query: string) => void;
};

export function SearchForm({ initial = "", busy, compact, onSubmit }: SearchFormProps) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    setValue(initial);
  }, [initial]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = value.trim();
    if (next.length < 3 || busy) return;
    onSubmit(next);
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", compact ? "max-w-none" : "max-w-2xl")}>
      <div
        className={cn(
          "flex items-stretch gap-2 rounded-xl bg-surface p-1.5 shadow-[var(--shadow-border)]",
          "focus-within:shadow-[var(--shadow-border-hover)]",
        )}
      >
        <label htmlFor="chorus-q" className="sr-only">
          Ask a question
        </label>
        <input
          id="chorus-q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="What is the internet saying about…"
          autoComplete="off"
          enterKeyHint="search"
          className={cn(
            "min-h-11 min-w-0 flex-1 bg-transparent px-3.5 text-base text-fg outline-none",
            "placeholder:text-subtle",
          )}
        />
        <Button type="submit" disabled={busy || value.trim().length < 3} className="shrink-0 px-4">
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          <span className="hidden sm:inline">{busy ? "Listening" : "Listen"}</span>
        </Button>
      </div>
      {!compact ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => {
                setValue(question);
                onSubmit(question);
              }}
              className="rounded-full px-3 py-1.5 text-left text-xs text-muted shadow-[var(--shadow-border)] transition-colors duration-[var(--motion-quick)] hover:text-fg hover:shadow-[var(--shadow-border-hover)]"
            >
              {question}
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}
