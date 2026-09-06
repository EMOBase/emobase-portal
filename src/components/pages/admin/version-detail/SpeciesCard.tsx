import { X } from "lucide-react";

import { cn } from "@/utils/classname";
import type { SpeciesItem } from "./mockData";

const statusConfig = {
  complete: {
    label: "Complete",
    pill: "bg-green-50 text-green-700 border-green-700",
    dot: "bg-green-700",
    bar: "bg-blue-800/80",
  },
  processing: {
    label: "Processing",
    pill: "bg-yellow-50 text-yellow-600 border-yellow-600",
    dot: "bg-yellow-600",
    bar: "bg-blue-800/80",
  },
  failed: {
    label: "Failed",
    pill: "bg-red-50 text-red-700/90 border-red-700/90",
    dot: "bg-red-700/90",
    bar: "bg-red-700/90",
  },
} as const;

export default function SpeciesCard({
  species,
  href,
}: {
  species: SpeciesItem;
  href?: string;
}) {
  const config = statusConfig[species.status];

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5",
        href && "transition-shadow hover:shadow-md"
      )}
    >
      {/* Decorative background shape — rotated rounded square peeking from top-right */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-40 rounded-full bg-indigo-50/60" />

      {/* Content sits above the decoration via DOM order (both z-index: auto) */}
      <div className="relative">
        {href ? (
          <a
            href={href}
            className="absolute inset-0 rounded-xl"
            aria-label={`Manage files for ${species.shorthand}`}
          />
        ) : null}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-bold leading-tight text-slate-900">
              {species.shorthand}
            </h3>
            <p className="mt-0.5 text-sm italic leading-tight text-slate-500">
              {species.scientificName}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full pl-2 pr-2.5 py-0.5 text-xs font-semibold border",
              config.pill
            )}
          >
            <span className={cn("size-1.5 rounded-full", config.dot)} />
            {config.label}
          </span>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-slate-500">Genomic Assembly</span>
            <span className="font-semibold text-slate-700">
              {species.progress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full", config.bar)}
              style={{ width: `${species.progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {species.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
            >
              <X className="size-3" strokeWidth={2.5} />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
