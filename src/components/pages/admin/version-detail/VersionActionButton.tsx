import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export type VersionStatus =
  "DRAFT" | "PROCESSING" | "READY" | "ERROR" | "MISSING_REQUIRED_FILE";

export type VersionActionKind = "release" | "sync";

export type VersionActionButtonProps = {
  status?: VersionStatus;
  isDefault?: boolean;
  pending?: VersionActionKind | null;
  onRelease?: () => void;
  onSync?: () => void;
};

/**
 * The "Set as Default" / "Sync" action for a Database Version.
 *
 * A READY version that is not yet the default can be released ("set as
 * default"); once it is the default the same action re-syncs it. Ported from
 * emobase-web's VersionDetails header.
 */
export default function VersionActionButton({
  status,
  isDefault = false,
  pending = null,
  onRelease,
  onSync,
}: VersionActionButtonProps) {
  const showRelease = status === "READY" && !isDefault;
  const showSync = isDefault;

  if (!showRelease && !showSync) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      {showRelease && (
        <ConfirmDialog
          trigger={
            <Button
              variant="outline"
              disabled={pending !== null}
              className="gap-2"
            >
              {pending === "release" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CheckCircle2 />
              )}
              Set as Default
            </Button>
          }
          title="Set as Default"
          description={
            <>
              Are you sure you want to set this version to be the default
              version?
            </>
          }
          onConfirm={onRelease}
        />
      )}

      {showSync && (
        <Button
          variant="outline"
          onClick={onSync}
          disabled={pending !== null}
          className="gap-2"
        >
          {pending === "sync" ? (
            <Loader2 className="animate-spin" />
          ) : (
            <RefreshCw />
          )}
          Sync
        </Button>
      )}
    </div>
  );
}
