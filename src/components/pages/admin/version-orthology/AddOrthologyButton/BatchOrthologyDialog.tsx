import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CloudUpload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { useForm } from "@/hooks/useForm";
import useService from "@/hooks/useService";
import genomicsService from "@/utils/services/genomics";

import { BundleRecipe } from "./BundleRecipe";
import type { OnBatchConfirm } from "./types";

type BatchOrthologyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: OnBatchConfirm;
};

export function BatchOrthologyDialog({
  open,
  onOpenChange,
  onConfirm,
}: BatchOrthologyDialogProps) {
  const [downloadingTemplate, setDownloadingTemplate] = React.useState(false);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);
  const { fetchManifestTemplate } = useService(genomicsService);
  const form = useForm<{ bundle: File | null }>({
    defaultValues: { bundle: null },
    validate: (values) => ({
      bundle: !values.bundle
        ? "Please choose a bundle archive"
        : !/\.(zip|tar\.gz)$/i.test(values.bundle.name)
          ? "Bundle must be a .zip or .tar.gz archive"
          : undefined,
    }),
    onSubmit: (values) => onConfirm?.(values.bundle!),
  });

  async function handleConfirm() {
    if (await form.handleSubmit()) {
      form.reset();
      onOpenChange(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) form.reset();
    onOpenChange(next);
  }

  async function handleDownloadTemplate() {
    setDownloadingTemplate(true);
    setDownloadError(null);
    try {
      const blob = await fetchManifestTemplate("orthology.bundle");
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      // The backend matches the manifest by this exact name at the archive
      // root, so it must be saved as manifest.csv - not the server's
      // Content-Disposition filename.
      anchor.download = "manifest.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Could not download the template. Please try again.");
    } finally {
      setDownloadingTemplate(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />
        <Dialog.Popup
          ref={form.formRef}
          className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border border-slate-200 bg-white p-6 shadow-lg outline-none"
        >
          {/* The header and the action row carry a divider each, so the
              dialog reads as a top and a bottom band around the recipe. */}
          <div className="relative mb-4 border-b border-slate-100 pb-4 pr-8">
            <Dialog.Title className="text-xl font-bold text-slate-900">
              Add Orthology Batch
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm leading-relaxed text-slate-500">
              Upload one bundle archive (.zip or .tar.gz) holding every
              orthology dataset for this version. The backend reads the per-file
              metadata from a manifest.csv inside the archive, so the archive is
              the only file to upload.
            </Dialog.Description>
            <Dialog.Close
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close"
                  className="absolute right-0 top-0"
                >
                  <X className="size-4" />
                </Button>
              }
            />
          </div>

          <BundleRecipe
            onDownloadTemplate={handleDownloadTemplate}
            downloadingTemplate={downloadingTemplate}
          />

          {downloadError ? (
            <p className="-mt-2 mb-4 text-xs text-destructive">
              {downloadError}
            </p>
          ) : null}

          {form.formError ? (
            <p className="mb-2 text-sm text-destructive">{form.formError}</p>
          ) : null}

          {/* The archive picker and the actions share one row: in a dialog this
              wide the file input does not need a row of its own. */}
          <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
            <div className="min-w-[16rem] flex-1">
              <Field
                label="Bundle Archive"
                htmlFor="orthology-bundle"
                className="mb-0"
              >
                <FileInput
                  id="orthology-bundle"
                  accept=".zip,.tar.gz,application/zip,application/gzip,application/x-gzip"
                  value={form.values.bundle}
                  onFiles={(files) => form.setField("bundle", files[0] ?? null)}
                  disabled={form.submitting}
                  aria-invalid={Boolean(form.errors.bundle)}
                  aria-describedby={
                    form.errors.bundle ? "orthology-bundle-error" : undefined
                  }
                />
              </Field>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="default"
                onClick={handleConfirm}
                disabled={form.submitting}
              >
                <CloudUpload className="h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>
          {form.errors.bundle ? (
            <p
              id="orthology-bundle-error"
              className="mt-1 text-sm text-destructive"
            >
              {form.errors.bundle}
            </p>
          ) : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
