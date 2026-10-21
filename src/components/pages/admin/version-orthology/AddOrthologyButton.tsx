import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import {
  ChevronDown,
  CloudUpload,
  FilePlusCorner,
  Files,
  Plus,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { Input } from "@/components/ui/input";
import { useForm } from "@/hooks/useForm";
import useService from "@/hooks/useService";
import genomicsService from "@/utils/services/genomics";

type OnConfirm = (file: File, order: number, algorithm: string) => void;

const triggerClassName =
  "inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50";

function useOrthologyUploadDialog(onConfirm?: OnConfirm) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<{
    file: File | null;
    order: string;
    algorithm: string;
  }>({
    defaultValues: { file: null, order: "1", algorithm: "" },
    validate: (values) => {
      const file = values.file;
      const orderValue = Number(values.order);
      return {
        file: !file
          ? "Please select a file to upload"
          : !file.name.endsWith(".gz") && !file.name.endsWith(".gzip")
            ? "Only .gz or .gzip files are accepted"
            : undefined,
        order:
          values.order.trim() === "" ||
          Number.isNaN(orderValue) ||
          orderValue <= 0 ||
          !Number.isInteger(orderValue)
            ? "Please enter a valid positive integer"
            : undefined,
        algorithm: values.algorithm.trim()
          ? undefined
          : "Please enter an algorithm name",
      };
    },
    onSubmit: (values) =>
      onConfirm?.(values.file!, Number(values.order), values.algorithm.trim()),
  });

  async function handleConfirm() {
    if (await form.handleSubmit()) {
      setOpen(false);
      form.reset();
    }
  }

  const dialog = (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />
        <Dialog.Popup
          ref={form.formRef}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white p-6 shadow-lg outline-none"
        >
          <Dialog.Title className="text-xl font-bold text-slate-900 mb-1.5">
            Add Orthology Dataset
          </Dialog.Title>
          <Dialog.Description className="text-sm text-slate-500 mb-6">
            Upload a compressed orthology mapping dataset. It is shared across
            every species in this version.
          </Dialog.Description>

          <Field
            label="Source File"
            htmlFor="orthology-file"
            error={form.errors.file}
          >
            <FileInput
              id="orthology-file"
              accept=".gz,.gzip"
              value={form.values.file}
              onFiles={(files) => form.setField("file", files[0] ?? null)}
              disabled={form.submitting}
              aria-invalid={Boolean(form.errors.file)}
            />
          </Field>

          <Field
            label="Display Order"
            htmlFor="orthology-order"
            error={form.errors.order}
          >
            <Input
              id="orthology-order"
              type="number"
              min="1"
              step="1"
              value={form.values.order}
              onChange={(e) => form.setField("order", e.target.value)}
              placeholder="e.g., 1"
              disabled={form.submitting}
              aria-invalid={Boolean(form.errors.order)}
            />
          </Field>

          <Field
            label="Algorithm"
            htmlFor="orthology-algorithm"
            error={form.errors.algorithm}
          >
            <Input
              id="orthology-algorithm"
              value={form.values.algorithm}
              onChange={(e) => form.setField("algorithm", e.target.value)}
              placeholder="e.g., OrthoFinder 2.0"
              disabled={form.submitting}
              aria-invalid={Boolean(form.errors.algorithm)}
            />
          </Field>

          {form.formError ? (
            <p className="mb-2 text-sm text-destructive">{form.formError}</p>
          ) : null}

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close
              render={
                <Button variant="outline" disabled={form.submitting}>
                  Cancel
                </Button>
              }
            />
            <Button
              variant="default"
              onClick={handleConfirm}
              disabled={form.submitting}
            >
              <CloudUpload className="h-4 w-4" />
              Confirm & Upload
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );

  return { openDialog: () => setOpen(true), dialog };
}

// One numbered step of the bundle recipe. The number sits in the left gutter
// so the steps read as a sequence without a card per step - cards of uneven
// height only waste vertical space.
function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        {children}
      </div>
    </li>
  );
}

type OnBatchConfirm = (bundleFile: File) => void;

function useOrthologyBundleDialog(onConfirm?: OnBatchConfirm) {
  const [open, setOpen] = React.useState(false);
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
      setOpen(false);
      form.reset();
    }
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

  const dialog = (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        form.reset();
      }}
    >
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

          <ol className="mb-4 space-y-3">
            <Step n={1} title="Get the manifest template">
              <p className="text-sm leading-relaxed text-slate-600">
                One row per file you upload, with the metadata the backend needs
                for it.
              </p>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={downloadingTemplate}
                className="mt-1 text-sm font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloadingTemplate
                  ? "Downloading…"
                  : "Download manifest.csv template"}
              </button>
            </Step>

            <Step n={2} title="Collect the files in one folder">
              <p className="text-sm leading-relaxed text-slate-600">
                Put every orthology file you want to upload into one folder
                (e.g. <code className="font-mono text-xs">orthologies</code>),
                together with the downloaded manifest.csv.
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-500">
                <li>
                  Every file must end up at the top level of the archive, no
                  folders - manifest.csv included.
                </li>
                <li>Data files may be plain or already gzipped.</li>
              </ul>
            </Step>

            <Step n={3} title="Fill in the manifest">
              <p className="text-sm leading-relaxed text-slate-600">
                One row per data file, with the columns{" "}
                <code className="font-mono text-xs">fileName</code>,{" "}
                <code className="font-mono text-xs">order</code>,{" "}
                <code className="font-mono text-xs">algorithm</code>.
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-500">
                <li>
                  <code className="font-mono text-xs">fileName</code> - the name
                  of the file inside the archive, spelled exactly like it.
                </li>
                <li>
                  <code className="font-mono text-xs">order</code> - the display
                  order of the dataset, an integer (1, 2, 3...).
                </li>
                <li>
                  <code className="font-mono text-xs">algorithm</code> - the
                  tool that produced the mapping, e.g. OrthoFinder 2.0.
                </li>
              </ul>
            </Step>

            <Step n={4} title="Create the archive">
              <p className="text-sm leading-relaxed text-slate-600">
                Run the command in the parent folder, so the files land at the
                top level of the archive.
              </p>
              <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    macOS / Linux
                  </p>
                  <code className="mt-0.5 block break-words rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
                    COPYFILE_DISABLE=1 tar czf bundle.tar.gz -C orthologies .
                  </code>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    macOS / Linux, for a .zip
                  </p>
                  <code className="mt-0.5 block break-words rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
                    zip -j bundle.zip orthologies/*
                  </code>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Windows (PowerShell)
                  </p>
                  <code className="mt-0.5 block break-words rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
                    Compress-Archive -Path .\orthologies\* -DestinationPath
                    bundle.zip
                  </code>
                </div>
              </div>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-slate-500">
                <li>
                  COPYFILE_DISABLE=1 keeps macOS from adding hidden{" "}
                  <code className="font-mono text-xs">._*</code> files.
                </li>
                <li>
                  Never compress the folder itself - that nests it inside the
                  archive, which the backend rejects.
                </li>
              </ul>
            </Step>
          </ol>
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

  return { openDialog: () => setOpen(true), dialog };
}

export function AddSingleOrthologyButton({
  onConfirm,
}: {
  onConfirm?: OnConfirm;
}) {
  const { openDialog, dialog } = useOrthologyUploadDialog(onConfirm);

  return (
    <>
      <button type="button" className={triggerClassName} onClick={openDialog}>
        <FilePlusCorner className="size-4" strokeWidth={2.5} />
        Add Single Dataset
      </button>
      {dialog}
    </>
  );
}

export function AddBatchOrthologyButton({
  onConfirm,
}: {
  onConfirm?: OnBatchConfirm;
}) {
  const { openDialog, dialog } = useOrthologyBundleDialog(onConfirm);

  return (
    <>
      <button type="button" className={triggerClassName} onClick={openDialog}>
        <Files className="size-4" strokeWidth={2.5} />
        Add Batch
      </button>
      {dialog}
    </>
  );
}

export default function AddOrthologyButton({
  onConfirm,
  onBatchConfirm,
}: {
  onConfirm?: OnConfirm;
  onBatchConfirm?: OnBatchConfirm;
}) {
  const single = useOrthologyUploadDialog(onConfirm);
  const batch = useOrthologyBundleDialog(onBatchConfirm);

  return (
    <>
      <Menu.Root>
        <Menu.Trigger
          render={
            <button type="button" className={triggerClassName}>
              <Plus className="size-4" strokeWidth={2.5} />
              Add Orthology
              <ChevronDown className="size-3.5 text-slate-400" />
            </button>
          }
        />
        <Menu.Portal>
          <Menu.Positioner
            align="end"
            sideOffset={8}
            className="z-50 outline-none"
          >
            <Menu.Popup className="min-w-56 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
              <Menu.Item
                onClick={single.openDialog}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-slate-700 outline-none data-[highlighted]:bg-muted"
              >
                <FilePlusCorner className="h-4 w-4" />
                Add Single Dataset
              </Menu.Item>
              <Menu.Item
                onClick={batch.openDialog}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-slate-700 outline-none data-[highlighted]:bg-muted"
              >
                <Files className="h-4 w-4" />
                Add Batch
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {single.dialog}
      {batch.dialog}
    </>
  );
}
