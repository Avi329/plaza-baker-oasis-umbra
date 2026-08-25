import { cn } from "@/lib/utils";

export function ChorusMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("text-fg", className)}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 22.5c0-5.6 4.1-10 9-10s9 4.4 9 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10.5 22.5c0-3.4 2.5-6 5.5-6s5.5 2.6 5.5 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="16" cy="22.5" r="1.7" fill="currentColor" />
    </svg>
  );
}
