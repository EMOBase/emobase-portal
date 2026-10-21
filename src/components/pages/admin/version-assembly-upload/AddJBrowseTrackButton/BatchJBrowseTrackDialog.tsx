import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CloudUpload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { useForm } from "@/hooks/useForm";
import useService from "@/hooks/useService";
import genomicsService from "@/utils/services/genomics";
import { BundleRecipe } from "@/components/pages/admin/BundleRecipe";

import type { OnBatchConfirm } from "./types";

type BatchJBrowseTrackDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: OnBatchConfirm;
};

// The columns the manifest template of a JBrowse2 track bundle has.
const TRACK_MANIFEST_COLUMNS = [
  {
    name: "fileName",
    hint: "the name of the file inside the archive, spelled exactly like it.",
  },
  {
    name: "trackName",
    hint: "the name of the track in JBrowse2. It must be unique within the bundle.",
  },
  {
    name: "category",
    hint: "optional: a group for the track, e.g. Functional annotation.",
  },
  {
    name: "selectInDefaultSession",
    hint: "optional: whether the track is shown in the default session (true or false).",
  },
];

export function BatchJBrowseTrackDialog({
  open,
  onOpenChange,
  onConfirm,
}: BatchJBrowseTrackDialogProps) {
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
      const blob = await fetchManifestTemplate("jbrowse.track.bundle");
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      // The system matches the manifest by this exact name at the archive
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
          className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-8 shadow-lg outline-none"
        >
          <Dialog.Close className="absolute right-6 top-6 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <Dialog.Title className="font-display text-2xl font-bold text-slate-900">
            Batch upload Track
          </Dialog.Title>

          <Dialog.Description className="mt-2 text-sm leading-relaxed text-slate-500">
            Upload one bundle archive (.zip or .tar.gz) that contains multiple
            JBrowse2 tracks for this assembly, along with a manifest.csv that
            maps each track file to its metadata.
          </Dialog.Description>

          <BundleRecipe
            onDownloadTemplate={handleDownloadTemplate}
            downloadingTemplate={downloadingTemplate}
            folderName="tracks"
            itemLabel="track file"
            fileTypesHint="Track files may be plain (.bw) or already compressed (.bgz, .gz)."
            columns={TRACK_MANIFEST_COLUMNS}
          />

          {downloadError ? (
            <p className="mt-4 text-xs text-destructive">{downloadError}</p>
          ) : null}

          {form.formError ? (
            <p className="mt-4 text-sm text-destructive">{form.formError}</p>
          ) : null}

          {/* The archive picker and the actions share one row: in a dialog this
              wide the file input does not need a row of its own. */}
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-6">
            <div className="min-w-[16rem] flex-1">
              <Field
                label="Bundle Archive"
                htmlFor="jbrowse-track-bundle"
                className="mb-0"
              >
                <FileInput
                  id="jbrowse-track-bundle"
                  accept=".zip,.tar.gz,application/zip,application/gzip,application/x-gzip"
                  value={form.values.bundle}
                  onFiles={(files) => form.setField("bundle", files[0] ?? null)}
                  disabled={form.submitting}
                  aria-invalid={Boolean(form.errors.bundle)}
                  aria-describedby={
                    form.errors.bundle
                      ? "jbrowse-track-bundle-error"
                      : undefined
                  }
                />
              </Field>
            </div>
            <Button
              variant="default"
              onClick={handleConfirm}
              disabled={form.submitting}
            >
              <CloudUpload className="h-4 w-4" />
              Upload
            </Button>
          </div>
          {form.errors.bundle ? (
            <p
              id="jbrowse-track-bundle-error"
              className="mt-2 text-sm text-destructive"
            >
              {form.errors.bundle}
            </p>
          ) : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
