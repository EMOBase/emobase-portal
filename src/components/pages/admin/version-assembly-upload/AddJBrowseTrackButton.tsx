import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CloudUpload, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { Input } from "@/components/ui/input";
import { useForm } from "@/hooks/useForm";

export default function AddJBrowseTrackButton({
  onConfirm,
}: {
  onConfirm?: (
    file: File,
    trackName: string,
    category?: string,
    selectInDefaultSession?: boolean,
  ) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<{
    file: File | null;
    trackName: string;
    category: string;
    selectInDefaultSession: boolean;
  }>({
    defaultValues: {
      file: null,
      trackName: "",
      category: "",
      selectInDefaultSession: false,
    },
    validate: (values) => ({
      file: values.file ? undefined : "Please choose a track file",
      trackName: values.trackName.trim() ? undefined : "Track name is required",
    }),
    onSubmit: (values) =>
      onConfirm?.(
        values.file!,
        values.trackName.trim(),
        values.category.trim() || undefined,
        values.selectInDefaultSession,
      ),
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) form.reset();
  }

  async function handleConfirm() {
    if (await form.handleSubmit()) {
      setOpen(false);
      form.reset();
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger
        render={
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Add Track
          </button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />
        <Dialog.Popup
          ref={form.formRef}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white p-6 shadow-lg outline-none"
        >
          <Dialog.Title className="text-xl font-bold text-slate-900 mb-1.5">
            Add JBrowse2 Track
          </Dialog.Title>
          <Dialog.Description className="text-sm text-slate-500 mb-6">
            Upload a visualisation track for the JBrowse2 genome browser.
          </Dialog.Description>

          <Field
            label="Track File"
            htmlFor="jbrowse-track-file"
            error={form.errors.file}
          >
            <FileInput
              id="jbrowse-track-file"
              accept=".bw,.bgz,.gz"
              value={form.values.file}
              onFiles={(files) => form.setField("file", files[0] ?? null)}
              disabled={form.submitting}
              aria-invalid={Boolean(form.errors.file)}
            />
          </Field>

          <Field
            label="Track Name"
            htmlFor="jbrowse-track-name"
            error={form.errors.trackName}
          >
            <Input
              id="jbrowse-track-name"
              value={form.values.trackName}
              onChange={(e) => form.setField("trackName", e.target.value)}
              placeholder="e.g., Coverage track"
              disabled={form.submitting}
              aria-invalid={Boolean(form.errors.trackName)}
            />
          </Field>

          <Field label="Category" htmlFor="jbrowse-track-category" optional>
            <Input
              id="jbrowse-track-category"
              value={form.values.category}
              onChange={(e) => form.setField("category", e.target.value)}
              placeholder="e.g., Functional annotation"
              disabled={form.submitting}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.values.selectInDefaultSession}
              onChange={(e) =>
                form.setField("selectInDefaultSession", e.target.checked)
              }
              className="size-4 rounded-sm border-slate-300"
            />
            Select this track in default session
          </label>

          {form.formError ? (
            <p className="mt-4 text-sm text-destructive">{form.formError}</p>
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
