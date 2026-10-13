import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "link" | "danger";

const VARIANT: Record<Variant, string> = {
  primary: "bg-primary text-on-media hover:bg-primary-hover",
  secondary: "bg-hover text-foreground hover:bg-separator",
  ghost: "text-foreground hover:bg-hover",
  link: "text-primary hover:text-foreground px-0! h-auto!",
  danger: "text-danger hover:bg-hover",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-50",
        size === "sm" ? "h-8 px-4 text-sm" : "h-9 px-4",
        fullWidth && "w-full",
        VARIANT[variant],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  );
}
