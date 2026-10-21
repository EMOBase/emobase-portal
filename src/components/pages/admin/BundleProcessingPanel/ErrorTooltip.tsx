import { Tooltip } from "@base-ui/react/tooltip";
import { AlertCircle } from "lucide-react";

/**
 * The little alert on the left of a failed row. The message itself lives in
 * the tooltip, so a long error never breaks the layout of the row.
 */
export function ErrorTooltip({
  label,
  message,
  onOpenChange,
}: {
  label: string;
  message?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root onOpenChange={onOpenChange}>
        <Tooltip.Trigger
          type="button"
          aria-label={label}
          className="flex cursor-help items-center text-red-500"
        >
          {/* No padding: the 14px icon must fit inside the label line's
              15px box (10px * lh 1.5) or the row grows when the state
              changes. */}
          <AlertCircle className="size-3.5" />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner
            side="top"
            sideOffset={6}
            // Two-tier rule: page-hosted tooltips stay at z-50 (behind the
            // fixed corner stack - panel z-90, toasts z-100), while tooltips
            // hosted inside an overlay (this panel, or a toast) rise above
            // the whole stack. Portal renders body-level, so this z competes
            // directly.
            className="z-[110]"
          >
            <Tooltip.Popup className="max-w-xs break-words rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-md outline-none">
              {message}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
