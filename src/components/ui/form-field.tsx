import { cn } from "@/lib/utils";

export function FormField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <div className="space-y-1">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        {description ? (
          <p className="text-xs leading-5 text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </label>
  );
}

export function FieldError({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  if (!message) return null;

  return (
    <p className={cn("text-xs font-medium text-rose-600", className)}>
      {message}
    </p>
  );
}
