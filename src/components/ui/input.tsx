import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-md bg-elevated px-3.5 text-base text-fg shadow-[var(--shadow-border)]",
        "placeholder:text-subtle transition-[box-shadow,background-color] duration-[var(--motion-quick)]",
        "focus-visible:outline-none focus-visible:shadow-[var(--shadow-border-hover)] focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
