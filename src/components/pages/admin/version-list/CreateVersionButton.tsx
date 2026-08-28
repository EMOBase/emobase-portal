import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateVersionButton({
  onCreate,
}: {
  onCreate?: (name: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function handleContinue() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Version name is required");
      return;
    }
    onCreate?.(trimmed);
    setOpen(false);
    setName("");
    setError(null);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => setOpen(next)}>
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
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-6 shadow-lg outline-none">
          <Dialog.Title className="text-xl font-bold text-slate-900 mb-1.5">
            Create New Version
          </Dialog.Title>
          <Dialog.Description className="text-sm text-slate-500 mb-6">
            Initialize a new version of genomic data.
          </Dialog.Description>

          <div className="mb-4">
            <label
              htmlFor="version-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Version Name
            </label>
            <Input
              id="version-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g., v3.5.0"
              aria-invalid={error ? true : undefined}
            />
            {error ? (
              <p className="mt-1 text-sm text-destructive">{error}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 rounded-lg bg-blue-50 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Info
            </span>
            <p className="text-sm leading-relaxed text-blue-800">
              This version will be isolated from the production stream until
              required files are uploaded and processed.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close render={<Button variant="outline">Cancel</Button>} />
            <Button variant="default" onClick={handleContinue}>
              Continue
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
