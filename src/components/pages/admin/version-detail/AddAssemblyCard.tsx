import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import genomicsService from "@/utils/services/genomics";
import useService from "@/hooks/useService";

export default function AddAssemblyCard({
  versionName,
}: {
  versionName: string;
}) {
  const { createAssemblyVersion } = useService(genomicsService);

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [species, setSpecies] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setName("");
    setSpecies("");
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
    if (!trimmedName) {
      setError("Assembly name is required");
      return;
    }
    if (!trimmedSpecies) {
      setError("Species code is required");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await createAssemblyVersion(versionName, {
        name: trimmedName,
        species: trimmedSpecies,
      });
      window.location.assign(
        `/admin/versions/${encodeURIComponent(versionName)}/species/${encodeURIComponent(res.data.species)}`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create assembly",
      );
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger
        render={
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/50"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <Plus className="size-5" />
            </span>
            <span className="text-sm font-semibold text-slate-700">
              Add new Assembly
            </span>
          </button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white p-6 shadow-lg outline-none">
          <Dialog.Title className="text-xl font-bold text-slate-900 mb-1.5">
            Add new Assembly
          </Dialog.Title>
          <Dialog.Description className="text-sm text-slate-500 mb-6">
            Add a new assembly to version {versionName}.
          </Dialog.Description>

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
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
