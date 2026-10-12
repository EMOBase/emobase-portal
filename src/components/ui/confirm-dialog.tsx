import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  trigger: React.ReactElement;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<unknown> | void;
};

function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (submitting) return;
    setOpen(next);
    if (!next) setError(null);
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
      setSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger render={trigger} />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white p-6 shadow-lg outline-none">
          <Dialog.Title className="text-xl font-bold text-slate-900 mb-1.5">
            {title}
          </Dialog.Title>
          {description ? (
            <Dialog.Description className="text-sm text-slate-500">
              {description}
            </Dialog.Description>
          ) : null}

          {error ? (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          ) : null}

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close
              render={
                <Button variant="outline" disabled={submitting}>
                  {cancelLabel}
                </Button>
              }
            />
            <Button
              variant={destructive ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  {confirmLabel}
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { ConfirmDialog };
