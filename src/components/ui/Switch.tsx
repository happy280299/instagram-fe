import { cn } from "@/lib/cn";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Id of the element naming the setting. */
  labelledBy: string;
  disabled?: boolean;
}

/** On/off toggle (role="switch"). */
export function Switch({ checked, onChange, labelledBy, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-10 shrink-0 rounded-full transition-colors disabled:opacity-60", checked ? "bg-primary" : "bg-separator")}
    >
      <span aria-hidden className={cn("bg-on-media absolute top-0.5 left-0.5 size-5 rounded-full shadow transition-transform", checked && "translate-x-4")} />
    </button>
  );
}
