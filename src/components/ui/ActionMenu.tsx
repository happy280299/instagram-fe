"use client";

import { cn } from "@/lib/cn";
import { Modal } from "./Modal";

export interface ActionItem {
  label: string;
  onSelect: () => void;
  tone?: "default" | "danger" | "bold";
}

interface ActionMenuProps {
  open: boolean;
  onClose: () => void;
  title: string;
  actions: ActionItem[];
}

/** Instagram-style stacked action sheet. A "Cancel" row is always appended. */
export function ActionMenu({ open, onClose, title, actions }: ActionMenuProps) {
  const items: ActionItem[] = [...actions, { label: "Cancel", onSelect: onClose }];
  return (
    <Modal open={open} onClose={onClose} title={title} hideTitle>
      <ul className="divide-separator flex flex-col divide-y" role="menu">
        {items.map((item) => (
          <li key={item.label} role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                item.onSelect();
                if (item.label !== "Cancel") onClose();
              }}
              className={cn(
                "hover:bg-hover min-h-12 w-full px-4 py-3 text-center text-sm transition-colors",
                item.tone === "danger" && "text-danger font-bold",
                item.tone === "bold" && "font-bold",
              )}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
