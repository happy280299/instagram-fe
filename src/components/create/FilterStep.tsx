"use client";

import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/cn";
import { DraftPreview } from "./DraftPreview";
import { type Draft, FILTERS } from "./types";

export function FilterStep({ draft, onChange }: { draft: Draft; onChange: (draft: Draft) => void }) {
  return (
    <div className="flex w-full flex-col md:h-full md:flex-row">
      <div className="aspect-square w-full md:h-full md:w-auto">
        <DraftPreview draft={draft} />
      </div>
      <fieldset className="grid grid-cols-4 gap-3 overflow-y-auto p-4 md:w-[340px] md:grid-cols-3 md:content-start">
        <legend className="sr-only">Filters</legend>
        {FILTERS.map((f) => (
          <label key={f.id} className="flex cursor-pointer flex-col items-center gap-1.5 has-[:focus-visible]:outline-2">
            <input type="radio" name="filter" className="sr-only" checked={draft.filter.id === f.id} onChange={() => onChange({ ...draft, filter: f })} />
            <span className={cn("relative block aspect-square w-full overflow-hidden rounded-md", draft.filter.id === f.id && "ring-primary ring-2")}>
              <SafeImage src={draft.src} alt="" fill sizes="88px" className="object-cover" style={{ filter: f.css }} />
            </span>
            <span className={cn("text-xs", draft.filter.id === f.id ? "text-primary font-semibold" : "text-muted")}>{f.name}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
