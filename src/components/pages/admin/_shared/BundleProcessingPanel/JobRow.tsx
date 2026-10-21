import { ProgressBar } from "@/components/pages/admin/_shared/FileCard/ProgressBar";
import { ErrorTooltip } from "./ErrorTooltip";
import { PanelRow } from "./PanelRow";
import { CompletePill, StatusPill } from "./StatusPills";
import type { PanelJobRow } from "./types";
import { jobErrorKey } from "./utils";

/**
 * A job the system is working on - or one that just finished and is still
 * animating out.
 */
export function JobRow({
  row,
  onHold,
  onRelease,
  onTouch,
  onDismiss,
}: {
  row: PanelJobRow;
  onHold: (key: string) => void;
  onRelease: (key: string) => void;
  onTouch: (key: string) => void;
  onDismiss: (jobId: number) => void;
}) {
  const isFailed = !row.completed && row.status === "FAILED";
  const errorKey = jobErrorKey(row.key);

  return (
    <PanelRow
      name={row.name}
      pill={
        row.completed ? <CompletePill /> : <StatusPill status={row.status} />
      }
      isFailed={isFailed}
      onHold={() => onHold(errorKey)}
      onRelease={() => onRelease(errorKey)}
      onTouch={() => onTouch(errorKey)}
      onDismiss={() => onDismiss(row.key)}
    >
      {/* Bar for every row shape: a witnessed failure keeps its
          element from the active state, so progress transitions to
          100% (red, ERROR label) exactly like a completion does. */}
      <ProgressBar
        progress={
          row.completed || isFailed ? 100 : row.status === "RUNNING" ? 50 : 10
        }
        title={
          row.completed || isFailed ? "" : row.description || "Extract bundle"
        }
        theme={row.completed ? "green" : isFailed ? "red" : "orange"}
        size="sm"
        showComplete={row.completed}
        showError={isFailed}
        // Job errors come from the system's error log and can be
        // long: park the FileCard-style icon in the bar's empty
        // left label slot and keep the full message in a tooltip.
        leftSlot={
          isFailed ? (
            <ErrorTooltip
              label="Bundle extraction error"
              message={row.error || "Processing failed"}
              onOpenChange={(open) =>
                open ? onHold(errorKey) : onRelease(errorKey)
              }
            />
          ) : undefined
        }
      />
    </PanelRow>
  );
}
