import { ProgressBar } from "@/components/pages/admin/_shared/FileCard/ProgressBar";
import { ErrorTooltip } from "./ErrorTooltip";
import { PanelRow } from "./PanelRow";
import { UploadPill } from "./StatusPills";
import type { BundleUploadItem } from "./types";
import { uploadErrorKey } from "./utils";

/**
 * A bundle that is still on its way to the system. This is the client-side
 * half of the lifecycle: the archive is on the wire, or it has landed and
 * waits for its extraction job to show up.
 */
export function UploadRow({
  upload,
  onHold,
  onRelease,
  onTouch,
  onDismiss,
}: {
  upload: BundleUploadItem;
  onHold: (key: string) => void;
  onRelease: (key: string) => void;
  onTouch: (key: string) => void;
  onDismiss?: (uploadId: string) => void;
}) {
  const isFailed = upload.status === "FAILED";
  const errorKey = uploadErrorKey(upload.id);

  return (
    <PanelRow
      name={upload.name}
      pill={<UploadPill status={upload.status} />}
      isFailed={isFailed}
      onHold={() => onHold(errorKey)}
      onRelease={() => onRelease(errorKey)}
      onTouch={() => onTouch(errorKey)}
      onDismiss={() => onDismiss?.(upload.id)}
    >
      <ProgressBar
        progress={upload.status === "UPLOADING" ? upload.progress : 100}
        title={
          upload.status === "UPLOADING"
            ? "Upload bundle"
            : upload.status === "UPLOADED"
              ? "Waiting for extraction"
              : ""
        }
        // Gray for every client-side state (in transit, or waiting
        // for the job to be listed); the orange bar belongs to
        // the system's own job rows.
        theme={isFailed ? "red" : "gray"}
        size="sm"
        showError={isFailed}
        leftSlot={
          isFailed ? (
            <ErrorTooltip
              label="Bundle upload error"
              message={upload.error || "Upload failed"}
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
