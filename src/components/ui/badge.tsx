import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
  tone = "default",
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "success" | "warning" | "danger" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
        {
          "bg-primary/10 text-primary": tone === "default",
          "bg-emerald-100 text-emerald-700": tone === "success",
          "bg-amber-100 text-amber-700": tone === "warning",
          "bg-rose-100 text-rose-700": tone === "danger",
          "bg-slate-100 text-slate-600": tone === "muted",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
