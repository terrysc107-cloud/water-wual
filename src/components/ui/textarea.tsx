import { cn } from "@/lib/utils";

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[120px] w-full rounded-xl border border-input bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-[var(--ring)]",
        props.className,
      )}
    />
  );
}
