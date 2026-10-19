import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import {
  ChevronDown,
  CloudUpload,
  FilePlusCorner,
  Files,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { Input } from "@/components/ui/input";
import { useForm } from "@/hooks/useForm";

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

type OnBatchConfirm = (bundleFile: File, metadataFile: File | null) => void;

function useOrthologyBundleDialog(onConfirm?: OnBatchConfirm) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<{ bundle: File | null; metadata: File | null }>({
    defaultValues: { bundle: null, metadata: null },
    validate: (values) => ({
      bundle: !values.bundle
        ? "Please choose a bundle archive"
        : !/\.(zip|tar\.gz)$/i.test(values.bundle.name)
          ? "Bundle must be a .zip or .tar.gz archive"
          : undefined,
    }),
    onSubmit: (values) => onConfirm?.(values.bundle!, values.metadata),
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
        form.reset();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />
        <Dialog.Popup
          ref={form.formRef}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white p-6 shadow-lg outline-none"
        >
          <Dialog.Title className="text-xl font-bold text-slate-900 mb-1.5">
            Add Orthology Batch
          </Dialog.Title>
          <Dialog.Description className="text-sm text-slate-500 mb-6">
            Upload a bundle archive (.zip or .tar.gz) holding every orthology
            dataset for this version. Per-file metadata is read from the
            manifest.csv inside the archive.
          </Dialog.Description>

          <Field
            label="Bundle Archive"
            htmlFor="orthology-bundle"
            error={form.errors.bundle}
          >
            <FileInput
              id="orthology-bundle"
              accept=".zip,.tar.gz,.gz,application/zip,application/gzip,application/x-gzip"
              value={form.values.bundle}
              onFiles={(files) => form.setField("bundle", files[0] ?? null)}
              disabled={form.submitting}
              aria-invalid={Boolean(form.errors.bundle)}
            />
          </Field>

          <Field
            label="Metadata CSV"
            htmlFor="orthology-metadata"
            optional
            error={form.errors.metadata}
          >
            <FileInput
              id="orthology-metadata"
              accept=".csv"
              value={form.values.metadata}
              onFiles={(files) => form.setField("metadata", files[0] ?? null)}
              disabled={form.submitting}
            />
          </Field>
          <p className="-mt-3 mb-4 text-xs text-slate-400">
            Not uploaded yet — the backend reads metadata from manifest.csv in
            the bundle.
          </p>

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
