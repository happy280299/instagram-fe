"use client";

import { Search } from "lucide-react";
import { useUIStore } from "@/store/ui";

/** Explore's search field on small screens; opens the search panel. */
export function MobileSearchTrigger() {
  const togglePanel = useUIStore((s) => s.togglePanel);
  return (
    <button
      type="button"
      onClick={() => togglePanel("search")}
      className="bg-hover text-muted mx-4 mb-3 flex w-[calc(100%-2rem)] items-center gap-2 rounded-lg px-4 py-2 text-left md:hidden"
    >
      <Search aria-hidden className="size-4" /> Search
    </button>
  );
}
