import { Dialog } from "@base-ui/react/dialog";
import { CloudUpload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { Input } from "@/components/ui/input";
import { useForm } from "@/hooks/useForm";

import type { OnConfirm } from "./types";

type SingleOrthologyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: OnConfirm;
};

export function SingleOrthologyDialog({
  open,
  onOpenChange,
  onConfirm,
}: SingleOrthologyDialogProps) {
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
      form.reset();
      onOpenChange(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) form.reset();
    onOpenChange(next);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
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
}
