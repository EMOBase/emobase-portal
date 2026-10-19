import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "@/hooks/useForm";

export default function CreateVersionButton({
  onCreate,
}: {
  onCreate?: (name: string) => Promise<unknown> | void;
}) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<{ name: string }>({
    defaultValues: { name: "" },
    validate: (values) => ({
      name: values.name.trim() ? undefined : "Version name is required",
    }),
    onSubmit: (values) => onCreate?.(values.name.trim()),
  });

  function handleOpenChange(next: boolean) {
    if (form.submitting) return;
    setOpen(next);
    if (!next) form.reset();
  }

  async function handleContinue() {
    if (await form.handleSubmit()) {
      window.location.assign(
        `/admin/versions/${encodeURIComponent(form.values.name.trim())}`,
      );
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger
        render={
          <Button className="h-10 px-4">
            <Plus className="h-4 w-4" />
            Create New Version
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />
        <Dialog.Popup
          ref={form.formRef}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white p-6 shadow-lg outline-none"
        >
          <Dialog.Title className="text-xl font-bold text-slate-900 mb-1.5">
            Create New Version
          </Dialog.Title>
          <Dialog.Description className="text-sm text-slate-500 mb-6">
            Initialize a new version of genomic data.
          </Dialog.Description>

          <Field
            label="Version Name"
            htmlFor="version-name"
            error={form.errors.name}
          >
            <Input
              id="version-name"
              value={form.values.name}
              onChange={(e) => form.setField("name", e.target.value)}
              placeholder="e.g., v3.5.0"
              disabled={form.submitting}
              aria-invalid={Boolean(form.errors.name)}
            />
          </Field>

          <div className="flex flex-col gap-2 rounded-sm bg-blue-50 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Info
            </span>
            <p className="text-sm leading-relaxed text-blue-800">
              This version will be isolated from the production stream until
              required files are uploaded and processed.
            </p>
          </div>

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
              onClick={handleContinue}
              disabled={form.submitting}
            >
              {form.submitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
