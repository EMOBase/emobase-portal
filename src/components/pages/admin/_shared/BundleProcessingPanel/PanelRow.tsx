import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/utils/classname";

/**
 * The shell every row of the panel shares: the archive name with its state
 * pill, the bar below it, and the dismiss button a failed row can carry.
 */
export function PanelRow({
  name,
  pill,
  isFailed,
  onHold,
  onRelease,
  onTouch,
  onDismiss,
  children,
}: {
  name: string;
  pill: React.ReactNode;
  isFailed: boolean;
  onHold: () => void;
  onRelease: () => void;
  onTouch: () => void;
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex items-start gap-2 px-4 py-3"
      // A failure the user is not looking at removes itself; hovering
      // it (or opening its tooltip) holds it in place.
      onMouseEnter={isFailed ? onHold : undefined}
      onMouseLeave={isFailed ? onRelease : undefined}
      onClick={isFailed ? onTouch : undefined}
    >
      <div className="min-w-0 flex-1">
        <div className={cn("flex items-center gap-2", isFailed && "pr-7")}>
          <span
            className="truncate text-sm font-semibold text-slate-800"
            title={name}
          >
            {name}
          </span>
          {pill}
        </div>

        <div className="mt-2">{children}</div>
      </div>

      {isFailed ? (
        <button
          type="button"
          aria-label={`Dismiss ${name}`}
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
