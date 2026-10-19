import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AssemblyFormValues = {
  name: string;
  species: string;
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
  const [name, setName] = React.useState(defaultValues?.name ?? "");
  const [species, setSpecies] = React.useState(defaultValues?.species ?? "");
  const [infoUrl, setInfoUrl] = React.useState(defaultValues?.infoUrl ?? "");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setName(defaultValues?.name ?? "");
    setSpecies(defaultValues?.species ?? "");
    setInfoUrl(defaultValues?.infoUrl ?? "");
    setError(null);
    setSubmitting(false);
  }

  function handleOpenChange(next: boolean) {
    if (submitting) return;
    setOpen(next);
    if (!next) reset();
  }

  async function handleSubmit() {
    const trimmedName = name.trim();
    const trimmedSpecies = species.trim();
    const trimmedInfoUrl = infoUrl.trim();
    if (!trimmedName) {
      setError("Assembly name is required");
      return;
    }
    if (!trimmedSpecies) {
      setError("Species is required");
      return;
    }
    if (trimmedInfoUrl && !/^https?:\/\/.+/i.test(trimmedInfoUrl)) {
      setError("Link must be an absolute http or https URL");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: trimmedName,
        species: trimmedSpecies,
        infoUrl: trimmedInfoUrl,
      });
      setOpen(false);
      reset();
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
            <Dialog.Description className="text-sm text-slate-500 mb-6">
              {description}
            </Dialog.Description>
          ) : null}

          <div className="mb-4">
            <label
              htmlFor="assembly-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Name
            </label>
            <Input
              id="assembly-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Tcas 5.2"
              disabled={submitting}
              aria-invalid={error ? true : undefined}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="assembly-species"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Species
            </label>
            <Input
              id="assembly-species"
              value={species}
              onChange={(e) => {
                setSpecies(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Tribolium castaneum"
              disabled={submitting || lockSpecies}
              aria-invalid={error ? true : undefined}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="assembly-info-url"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Link{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <Input
              id="assembly-info-url"
              value={infoUrl}
              onChange={(e) => {
                setInfoUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="https://example.org"
              disabled={submitting}
              aria-invalid={error ? true : undefined}
            />
          </div>

          {error ? (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Dialog.Close
              render={
                <Button variant="outline" disabled={submitting}>
                  Cancel
                </Button>
              }
            />
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
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
