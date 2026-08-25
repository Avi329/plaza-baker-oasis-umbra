import { Skeleton } from "@/components/ui/skeleton";
import type { ChorusPulse } from "@/lib/chorus/types";

export function PulsePanel({
  pulse,
  pending,
}: {
  pulse: ChorusPulse | null;
  pending: boolean;
}) {
  if (pending && !pulse?.available) {
    return (
      <section className="rounded-xl bg-surface px-5 py-6 shadow-[var(--shadow-border)] sm:px-8 sm:py-8">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">The pulse</p>
        <Skeleton className="mt-4 h-8 w-4/5 bg-elevated" />
        <Skeleton className="mt-4 h-4 w-full bg-elevated" />
        <Skeleton className="mt-2 h-4 w-11/12 bg-elevated" />
        <Skeleton className="mt-2 h-4 w-3/4 bg-elevated" />
        <p className="mt-5 text-sm text-muted">
          Reading news-desk comment threads, Substack, and the open web…
        </p>
      </section>
    );
  }

  if (!pulse?.available) {
    return (
      <section className="rounded-xl bg-surface px-5 py-6 shadow-[var(--shadow-border)] sm:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">The pulse</p>
        <p className="mt-3 text-sm text-muted">
          {pulse?.error
            ? "Could not synthesize the room this time. The comments below still stand on their own."
            : "No synthesis yet."}
        </p>
      </section>
    );
  }

  const total = pulse.camps.reduce((sum, camp) => sum + camp.share, 0) || 1;

  return (
    <section className="rise-in rounded-xl bg-surface px-5 py-6 shadow-[var(--shadow-border)] sm:px-8 sm:py-8">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">The pulse</p>
      <h2
        data-pulse-headline
        className="mt-3 font-display text-2xl font-medium leading-snug tracking-display text-balance text-fg sm:text-3xl"
      >
        {pulse.headline}
      </h2>
      <div className="mt-4 space-y-3 text-[0.975rem] leading-relaxed text-pretty text-fg/90">
        {pulse.body.split(/\n+/).map((para) => (
          <p key={para.slice(0, 24)}>{para}</p>
        ))}
      </div>
      {pulse.camps.length > 0 ? (
        <div className="mt-6">
          <div className="flex h-2 overflow-hidden rounded-full bg-elevated">
            {pulse.camps.map((camp, i) => (
              <div
                key={camp.label}
                className="h-full"
                style={{
                  width: `${(camp.share / total) * 100}%`,
                  background: `color-mix(in oklab, var(--color-accent) ${90 - i * 22}%, var(--color-elevated))`,
                }}
                title={`${camp.label} ${camp.share}%`}
              />
            ))}
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {pulse.camps.map((camp) => (
              <li key={camp.label}>
                <p className="text-sm font-medium text-fg">
                  <span className="tabular-nums text-muted">{camp.share}%</span> {camp.label}
                </p>
                <p className="mt-1 text-sm leading-snug text-muted">{camp.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
