import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "@/hooks/useForm";

export type AssemblyFormValues = {
  name: string;
  speciesName: string;
  infoUrl: string;
};

type AssemblyFormModalProps = {
  trigger: React.ReactElement;
  title: string;
  description?: React.ReactNode;
  submitLabel: string;
  defaultValues?: Partial<AssemblyFormValues>;
  onSubmit: (values: AssemblyFormValues) => Promise<unknown> | void;
  lockSpecies?: boolean;
};

export default function AssemblyFormModal({
  trigger,
  title,
  description,
  submitLabel,
  defaultValues,
  onSubmit,
  lockSpecies = false,
}: AssemblyFormModalProps) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<AssemblyFormValues>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      speciesName: defaultValues?.speciesName ?? "",
      infoUrl: defaultValues?.infoUrl ?? "",
    },
    validate: (values) => {
      const name = values.name.trim();
      const speciesName = values.speciesName.trim();
      const infoUrl = values.infoUrl.trim();
      return {
        name: name ? undefined : "Assembly name is required",
        speciesName: speciesName ? undefined : "Species is required",
        infoUrl:
          infoUrl && !/^https?:\/\/.+/i.test(infoUrl)
            ? "Link must be an absolute http or https URL"
            : undefined,
      };
    },
    onSubmit: (values) =>
      onSubmit({
        name: values.name.trim(),
        speciesName: values.speciesName.trim(),
        infoUrl: values.infoUrl.trim(),
      }),
  });

  function handleOpenChange(next: boolean) {
    if (form.submitting) return;
    setOpen(next);
    form.reset();
  }

  async function handleSubmit() {
    if (await form.handleSubmit()) {
      setOpen(false);
      form.reset();
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger render={trigger} />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />
        <Dialog.Popup
          ref={form.formRef}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white p-6 shadow-lg outline-none"
        >
          <Dialog.Title className="text-xl font-bold text-slate-900 mb-1.5">
            {title}
          </Dialog.Title>
          {description ? (
            <Dialog.Description className="text-sm text-slate-500 mb-6">
              {description}
            </Dialog.Description>
          ) : null}

          <Field label="Name" htmlFor="assembly-name" error={form.errors.name}>
            <Input
              id="assembly-name"
              value={form.values.name}
              onChange={(e) => form.setField("name", e.target.value)}
              placeholder="e.g. Tcas 5.2"
              disabled={form.submitting}
              aria-invalid={Boolean(form.errors.name)}
            />
          </Field>

          <Field
            label="Species"
            htmlFor="assembly-species"
            error={form.errors.speciesName}
          >
            <Input
              id="assembly-species"
              value={form.values.speciesName}
              onChange={(e) => form.setField("speciesName", e.target.value)}
              placeholder="e.g. Tribolium castaneum"
              disabled={form.submitting || lockSpecies}
              aria-invalid={Boolean(form.errors.speciesName)}
            />
          </Field>

          <Field
            label="Link"
            htmlFor="assembly-info-url"
            optional
            error={form.errors.infoUrl}
          >
            <Input
              id="assembly-info-url"
              value={form.values.infoUrl}
              onChange={(e) => form.setField("infoUrl", e.target.value)}
              placeholder="e.g. https://example.org"
              disabled={form.submitting}
              aria-invalid={Boolean(form.errors.infoUrl)}
            />
          </Field>

          {form.formError ? (
            <p className="mb-4 text-sm text-destructive">{form.formError}</p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Dialog.Close
              render={
                <Button variant="outline" disabled={form.submitting}>
                  Cancel
                </Button>
              }
            />
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={form.submitting}
            >
              {form.submitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  {submitLabel}
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
