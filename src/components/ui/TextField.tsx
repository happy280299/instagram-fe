"use client";

import { Eye, EyeOff } from "lucide-react";
import { type InputHTMLAttributes, useId, useState } from "react";
import { cn } from "@/lib/cn";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  label: string;
}

/** Instagram-style input with a label that shrinks into the top-left when filled. */
export function TextField({ label, type = "text", className, value, ...props }: TextFieldProps) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const filled = String(value ?? "").length > 0;
  const isPassword = type === "password";

  return (
    <div className={cn("bg-secondary border-separator focus-within:border-muted relative flex h-[38px] items-center rounded-sm border", className)}>
      <label
        htmlFor={id}
        className={cn("text-muted pointer-events-none absolute left-2 origin-left transition-transform", filled ? "top-0.5 scale-[0.83] text-xs" : "text-xs")}
      >
        {label}
      </label>
      <input
        id={id}
        type={isPassword && reveal ? "text" : type}
        value={value}
        className={cn("h-full min-w-0 flex-1 bg-transparent px-2 text-xs outline-none", filled && "pt-3.5")}
        {...props}
      />
      {isPassword && filled && (
        <button type="button" onClick={() => setReveal((r) => !r)} className="px-2 text-sm font-semibold" aria-label={reveal ? "Hide password" : "Show password"}>
          {reveal ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
        </button>
      )}
    </div>
  );
}
