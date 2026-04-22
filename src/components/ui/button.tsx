"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-primary-foreground shadow-[0_10px_25px_rgba(18,92,115,0.22)] hover:bg-[#0f5165]":
            variant === "default",
          "border border-border bg-white text-slate-700 hover:bg-slate-50":
            variant === "outline",
          "bg-transparent text-slate-600 hover:bg-slate-100": variant === "ghost",
          "bg-secondary text-secondary-foreground hover:bg-[#d0e3ea]":
            variant === "secondary",
          "bg-danger text-white hover:bg-[#b91c1c]": variant === "danger",
          "h-9 px-3 text-sm": size === "sm",
          "h-11 px-4 text-sm": size === "md",
          "h-12 px-5 text-base": size === "lg",
        },
        className,
      )}
      {...props}
    />
  );
}
